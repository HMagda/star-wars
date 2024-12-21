import { Injectable } from '@nestjs/common';
import { SwapiService } from '../../common/swapi/swapi.service';
import { PlanetFilterInput } from './dto/planet-filter.input';
import { PaginationInput } from '../common/dto/pagination.input';
import { Planet } from './models/planet.model';

interface MinimalPlanet {
  uid: string;
  name: string;
  url: string;
}

interface PlanetProperties {
  name: string;
  diameter: string;
  rotation_period: string;
  orbital_period: string;
  gravity: string;
  population: string;
  climate: string;
  terrain: string;
  surface_water: string;
  films: string[];
  residents: string[];
}

@Injectable()
export class PlanetsService {
  constructor(private readonly swapiService: SwapiService) {}

  /**
   * Alternative method: gets full data for all planets even without `name` filter.
   * If `name` is provided and SWAPI returns full data directly, use it.
   * Otherwise, fetch each planet individually for full data.
   */
  async getAllPlanetsFullData(
    filter?: PlanetFilterInput,
    pagination?: PaginationInput,
  ): Promise<Planet[]> {
    const searchParam = filter?.name ? 'name' : undefined;
    const searchQuery = filter?.name;

    const data = await this.swapiService.getResourceList(
      'planets',
      searchParam,
      searchQuery,
      pagination?.page
    );

    const isFullData = data.result && Array.isArray(data.result);

    if ((!data.results || data.results.length === 0) && !isFullData) return [];

    let planets: Planet[];

    if (isFullData) {
      // Full data scenario
      planets = data.result.map((pl: { properties: PlanetProperties; uid: string }) => ({
        id: pl.uid,
        name: pl.properties.name,
        diameter: pl.properties.diameter ?? null,
        rotation_period: pl.properties.rotation_period ?? null,
        orbital_period: pl.properties.orbital_period ?? null,
        gravity: pl.properties.gravity ?? null,
        population: pl.properties.population ?? null,
        climate: pl.properties.climate ?? null,
        terrain: pl.properties.terrain ?? null,
        surface_water: pl.properties.surface_water ?? null,
        films: pl.properties.films ?? null,
        residents: pl.properties.residents ?? null,
      }));
    } else {
      // Minimal data scenario
      const minimalPlanets: MinimalPlanet[] = data.results;
      const uids = minimalPlanets.map((mp) => mp.uid);

      // Fetch full details for each planet in parallel
      const requests = uids.map((uid: string) => this.swapiService.getResourceById('planets', uid));
      const responses = await Promise.all(requests);

      planets = responses.map((res) => {
        const props = res.result.properties;
        const uid = res.result.uid;
        return {
          id: uid,
          name: props.name,
          diameter: props.diameter ?? null,
          rotation_period: props.rotation_period ?? null,
          orbital_period: props.orbital_period ?? null,
          gravity: props.gravity ?? null,
          population: props.population ?? null,
          climate: props.climate ?? null,
          terrain: props.terrain ?? null,
          surface_water: props.surface_water ?? null,
          films: props.films ?? null,
          residents: props.residents ?? null,
        };
      });
    }

    if (filter) {
      planets = this.applyFilters(planets, filter);
    }

    return planets;
  }

  async getAllPlanets(
    filter?: PlanetFilterInput,
    pagination?: PaginationInput
  ): Promise<Planet[]> {
    const name = filter?.name;
    const data = await this.swapiService.getResourceList(
      'planets',
      name ? 'name' : undefined,
      name,
      pagination?.page
    );

    const isFullData = data.result && Array.isArray(data.result);

    if ((!data.results || data.results.length === 0) && !isFullData) return [];

    let planets: Planet[];

    if (isFullData) {
      // Full data scenario
      planets = data.result.map((pl: { properties: PlanetProperties; uid: string }) => ({
        id: pl.uid,
        name: pl.properties.name,
        diameter: pl.properties.diameter ?? null,
        rotation_period: pl.properties.rotation_period ?? null,
        orbital_period: pl.properties.orbital_period ?? null,
        gravity: pl.properties.gravity ?? null,
        population: pl.properties.population ?? null,
        climate: pl.properties.climate ?? null,
        terrain: pl.properties.terrain ?? null,
        surface_water: pl.properties.surface_water ?? null,
        films: pl.properties.films ?? null,
        residents: pl.properties.residents ?? null,
      }));

      if (filter) {
        planets = this.applyFilters(planets, filter);
      }
    } else {
      const minimalPlanets: MinimalPlanet[] = data.results;
      planets = minimalPlanets.map((mp) => ({
        id: mp.uid,
        name: mp.name,
        diameter: undefined,
        rotation_period: undefined,
        orbital_period: undefined,
        gravity: undefined,
        population: undefined,
        climate: undefined,
        terrain: undefined,
        surface_water: undefined,
        films: undefined,
        residents: undefined,
      })) as Planet[];
    }

    return planets;
  }

  async getPlanetById(id: string): Promise<Planet> {
    const data = await this.swapiService.getResourceById('planets', id);
    const props = data.result.properties;

    return {
      id: data.result.uid,
      name: props.name,
      diameter: props.diameter ?? null,
      rotation_period: props.rotation_period ?? null,
      orbital_period: props.orbital_period ?? null,
      gravity: props.gravity ?? null,
      population: props.population ?? null,
      climate: props.climate ?? null,
      terrain: props.terrain ?? null,
      surface_water: props.surface_water ?? null,
    };
  }

  private applyFilters(planets: Planet[], filter: PlanetFilterInput): Planet[] {
    let filteredPlanets = planets;

    const search = filter.search?.toLowerCase();
    const name = filter.name?.toLowerCase();
    const diameter = filter.diameter?.toLowerCase();
    const rotation_period = filter.rotation_period?.toLowerCase();
    const orbital_period = filter.orbital_period?.toLowerCase();
    const gravity = filter.gravity?.toLowerCase();
    const population = filter.population?.toLowerCase();
    const climate = filter.climate?.toLowerCase();
    const terrain = filter.terrain?.toLowerCase();
    const surface_water = filter.surface_water?.toLowerCase();

    if (name) {
      filteredPlanets = filteredPlanets.filter((p) => p.name?.toLowerCase().includes(name));
    }
    if (diameter) {
      filteredPlanets = filteredPlanets.filter((p) => p.diameter?.toLowerCase().includes(diameter));
    }
    if (rotation_period) {
      filteredPlanets = filteredPlanets.filter((p) =>
        p.rotation_period?.toLowerCase().includes(rotation_period)
      );
    }
    if (orbital_period) {
      filteredPlanets = filteredPlanets.filter((p) =>
        p.orbital_period?.toLowerCase().includes(orbital_period)
      );
    }
    if (gravity) {
      filteredPlanets = filteredPlanets.filter((p) => p.gravity?.toLowerCase().includes(gravity));
    }
    if (population) {
      filteredPlanets = filteredPlanets.filter((p) => p.population?.toLowerCase().includes(population));
    }
    if (climate) {
      filteredPlanets = filteredPlanets.filter((p) => p.climate?.toLowerCase().includes(climate));
    }
    if (terrain) {
      filteredPlanets = filteredPlanets.filter((p) => p.terrain?.toLowerCase().includes(terrain));
    }
    if (surface_water) {
      filteredPlanets = filteredPlanets.filter((p) =>
        p.surface_water?.toLowerCase().includes(surface_water)
      );
    }

    if (search) {
      filteredPlanets = filteredPlanets.filter((p) =>
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.diameter && p.diameter.toLowerCase().includes(search)) ||
        (p.rotation_period && p.rotation_period.toLowerCase().includes(search)) ||
        (p.orbital_period && p.orbital_period.toLowerCase().includes(search)) ||
        (p.gravity && p.gravity.toLowerCase().includes(search)) ||
        (p.population && p.population.toLowerCase().includes(search)) ||
        (p.climate && p.climate.toLowerCase().includes(search)) ||
        (p.terrain && p.terrain.toLowerCase().includes(search)) ||
        (p.surface_water && p.surface_water.toLowerCase().includes(search))
      );
    }

    return filteredPlanets;
  }
}
