import { Injectable } from '@nestjs/common';
import { SwapiService } from '../../common/swapi/swapi.service';
import { VehicleFilterInput } from './dto/vehicle-filter.input';
import { PaginationInput } from '../common/dto/pagination.input';
import { Vehicle } from './models/vehicle.model';

interface MinimalVehicle {
  uid: string;
  name: string;
  url: string;
}

interface VehicleProperties {
  uid: string;
  name: string;
  model: string | null;
  vehicle_class: string | null;
  manufacturer: string | null;
  length: string | null;
  cost_in_credits: string | null;
  crew: string | null;
  passengers: string | null;
  max_atmosphering_speed: string | null;
  cargo_capacity: string | null;
  consumables: string | null;
}

@Injectable()
export class VehiclesService {
  constructor(private readonly swapiService: SwapiService) {}

  /**
   * This is an alternative implementation of the getAllVehicles method that fetches full data for each vehicle.
   * Similar to getAllStarshipsFullData in the starships service.
   */
  async getAllVehiclesFullData(
    filter?: VehicleFilterInput,
    pagination?: PaginationInput,
  ): Promise<Vehicle[]> {
    const searchParam = filter?.name ? 'name' : filter?.model ? 'model' : undefined;
    const searchQuery = filter?.name ?? filter?.model;

    const data = await this.swapiService.getResourceList(
      'vehicles',
      searchParam,
      searchQuery,
      pagination?.page,
    );

    const isFullData = data.result && Array.isArray(data.result);
    if ((!data.results || data.results.length === 0) && !isFullData) return [];

    let vehicles: Vehicle[];

    if (isFullData) {
      // Full data scenario
      vehicles = data.result.map(
        (v: {
          properties: Omit<VehicleProperties, 'uid'>;
          uid: string;
        }) => ({
          id: v.uid,
          name: v.properties.name,
          model: v.properties.model ?? null,
          vehicle_class: v.properties.vehicle_class ?? null,
          manufacturer: v.properties.manufacturer ?? null,
          cost_in_credits: v.properties.cost_in_credits ?? null,
          length: v.properties.length ?? null,
          crew: v.properties.crew ?? null,
          passengers: v.properties.passengers ?? null,
          max_atmosphering_speed: v.properties.max_atmosphering_speed ?? null,
          cargo_capacity: v.properties.cargo_capacity ?? null,
          consumables: v.properties.consumables ?? null,
        }),
      );
    } else {
      // Minimal data scenario
      const minimalVehicles: MinimalVehicle[] = data.results;
      const uids = minimalVehicles.map((mv) => mv.uid);

      // Fetch full details in parallel
      const requests = uids.map((uid: string) =>
        this.swapiService.getResourceById('vehicles', uid),
      );
      const responses = await Promise.all(requests);

      vehicles = responses.map((res) => {
        const props = res.result.properties;
        const uid = res.result.uid;
        return {
          id: uid,
          name: props.name,
          model: props.model ?? null,
          vehicle_class: props.vehicle_class ?? null,
          manufacturer: props.manufacturer ?? null,
          cost_in_credits: props.cost_in_credits ?? null,
          length: props.length ?? null,
          crew: props.crew ?? null,
          passengers: props.passengers ?? null,
          max_atmosphering_speed: props.max_atmosphering_speed ?? null,
          cargo_capacity: props.cargo_capacity ?? null,
          consumables: props.consumables ?? null,
        };
      });
    }

    if (filter) {
      vehicles = this.applyFilters(vehicles, filter);
    }

    return vehicles;
  }

  async getAllVehicles(
    filter?: VehicleFilterInput,
    pagination?: PaginationInput,
  ): Promise<Vehicle[]> {
    const searchParam = filter?.name ? 'name' : filter?.model ? 'model' : undefined;
    const searchQuery = filter?.name ?? filter?.model;

    const data = await this.swapiService.getResourceList(
      'vehicles',
      searchParam,
      searchQuery,
      pagination?.page,
    );

    const isFullData = data.result && Array.isArray(data.result);

    if ((!data.results || data.results.length === 0) && !isFullData) return [];

    let vehicles: Vehicle[];

    if (isFullData) {
      // Full data scenario
      vehicles = data.result.map(
        (v: {
          properties: Omit<VehicleProperties, 'uid'>;
          uid: string;
        }) => ({
          id: v.uid,
          name: v.properties.name,
          model: v.properties.model ?? null,
          vehicle_class: v.properties.vehicle_class ?? null,
          manufacturer: v.properties.manufacturer ?? null,
          cost_in_credits: v.properties.cost_in_credits ?? null,
          length: v.properties.length ?? null,
          crew: v.properties.crew ?? null,
          passengers: v.properties.passengers ?? null,
          max_atmosphering_speed: v.properties.max_atmosphering_speed ?? null,
          cargo_capacity: v.properties.cargo_capacity ?? null,
          consumables: v.properties.consumables ?? null,
        }),
      );

      if (filter) {
        vehicles = this.applyFilters(vehicles, filter);
      }
    } else {
      // Minimal data scenario
      const minimalVehicles: MinimalVehicle[] = data.results;
      vehicles = minimalVehicles.map((mv) => ({
        id: mv.uid,
        name: mv.name,
        model: undefined,
        vehicle_class: undefined,
        manufacturer: undefined,
        cost_in_credits: undefined,
        length: undefined,
        crew: undefined,
        passengers: undefined,
        max_atmosphering_speed: undefined,
        cargo_capacity: undefined,
        consumables: undefined,
      })) as Vehicle[];
    }

    return vehicles;
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const data = await this.swapiService.getResourceById('vehicles', id);
    const props = data?.result?.properties;

    return {
      id: data.result.uid,
      name: props.name,
      model: props.model ?? null,
      vehicle_class: props.vehicle_class ?? null,
      manufacturer: props.manufacturer ?? null,
      cost_in_credits: props.cost_in_credits ?? null,
      length: props.length ?? null,
      crew: props.crew ?? null,
      passengers: props.passengers ?? null,
      max_atmosphering_speed: props.max_atmosphering_speed ?? null,
      cargo_capacity: props.cargo_capacity ?? null,
      consumables: props.consumables ?? null,
    };
  }

  private applyFilters(vehicles: Vehicle[], filter: VehicleFilterInput): Vehicle[] {
    let filteredVehicles = vehicles;

    const search = filter.search?.toLowerCase();
    const name = filter.name?.toLowerCase();
    const model = filter.model?.toLowerCase();
    const vehicle_class = filter.vehicle_class?.toLowerCase();
    const manufacturer = filter.manufacturer?.toLowerCase();
    const cost_in_credits = filter.cost_in_credits?.toLowerCase();
    const length = filter.length?.toLowerCase();
    const crew = filter.crew?.toLowerCase();
    const passengers = filter.passengers?.toLowerCase();
    const max_atmosphering_speed = filter.max_atmosphering_speed?.toLowerCase();
    const cargo_capacity = filter.cargo_capacity?.toLowerCase();
    const consumables = filter.consumables?.toLowerCase();

    if (name) {
      filteredVehicles = filteredVehicles.filter((v) => v.name?.toLowerCase().includes(name));
    }
    if (model) {
      filteredVehicles = filteredVehicles.filter((v) => v.model?.toLowerCase().includes(model));
    }
    if (vehicle_class) {
      filteredVehicles = filteredVehicles.filter((v) =>
        v.vehicle_class?.toLowerCase().includes(vehicle_class),
      );
    }
    if (manufacturer) {
      filteredVehicles = filteredVehicles.filter((v) =>
        v.manufacturer?.toLowerCase().includes(manufacturer),
      );
    }
    if (cost_in_credits) {
      filteredVehicles = filteredVehicles.filter((v) =>
        v.cost_in_credits?.toLowerCase().includes(cost_in_credits),
      );
    }
    if (length) {
      filteredVehicles = filteredVehicles.filter((v) => v.length?.toLowerCase().includes(length));
    }
    if (crew) {
      filteredVehicles = filteredVehicles.filter((v) => v.crew?.toLowerCase().includes(crew));
    }
    if (passengers) {
      filteredVehicles = filteredVehicles.filter((v) =>
        v.passengers?.toLowerCase().includes(passengers),
      );
    }
    if (max_atmosphering_speed) {
      filteredVehicles = filteredVehicles.filter((v) =>
        v.max_atmosphering_speed?.toLowerCase().includes(max_atmosphering_speed),
      );
    }
    if (cargo_capacity) {
      filteredVehicles = filteredVehicles.filter((v) =>
        v.cargo_capacity?.toLowerCase().includes(cargo_capacity),
      );
    }
    if (consumables) {
      filteredVehicles = filteredVehicles.filter((v) =>
        v.consumables?.toLowerCase().includes(consumables),
      );
    }

    if (search) {
      filteredVehicles = filteredVehicles.filter(
        (v) =>
          (v.name && v.name.toLowerCase().includes(search)) ||
          (v.model && v.model.toLowerCase().includes(search)) ||
          (v.vehicle_class && v.vehicle_class.toLowerCase().includes(search)) ||
          (v.manufacturer && v.manufacturer.toLowerCase().includes(search)) ||
          (v.cost_in_credits && v.cost_in_credits.toLowerCase().includes(search)) ||
          (v.length && v.length.toLowerCase().includes(search)) ||
          (v.crew && v.crew.toLowerCase().includes(search)) ||
          (v.passengers && v.passengers.toLowerCase().includes(search)) ||
          (v.max_atmosphering_speed && v.max_atmosphering_speed.toLowerCase().includes(search)) ||
          (v.cargo_capacity && v.cargo_capacity.toLowerCase().includes(search)) ||
          (v.consumables && v.consumables.toLowerCase().includes(search)),
      );
    }

    return filteredVehicles;
  }
}
