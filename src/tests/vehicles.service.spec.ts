import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from '../resources/vehicles/vehicles.service';
import { SwapiService } from '../common/swapi/swapi.service';
import { VehicleFilterInput } from '../resources/vehicles/dto/vehicle-filter.input';

describe('VehiclesService', () => {
  let vehiclesService: VehiclesService;
  let swapiService: SwapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: SwapiService,
          useValue: {
            getResourceList: jest.fn(),
            getResourceById: jest.fn(),
          },
        },
      ],
    }).compile();

    vehiclesService = module.get<VehiclesService>(VehiclesService);
    swapiService = module.get<SwapiService>(SwapiService);
  });

  describe('getAllVehicles (Full Data Scenario)', () => {
    it('should return full data when name filter is provided', async () => {
      // Mock SWAPI returning full data structure
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: [
          {
            uid: '1',
            properties: {
              name: 'Sand Crawler',
              model: 'Digger Crawler',
              vehicle_class: 'wheeled',
              manufacturer: 'Corellia Mining Corporation',
              length: '36.8',
              cost_in_credits: '150000',
              crew: '46',
              passengers: '30',
              max_atmosphering_speed: '30',
              cargo_capacity: '50000',
              consumables: '2 months',
            },
          },
        ],
      });

      const vehicles = await vehiclesService.getAllVehicles({ name: 'Sand Crawler' });
      expect(vehicles).toEqual([
        {
          id: '1',
          name: 'Sand Crawler',
          model: 'Digger Crawler',
          vehicle_class: 'wheeled',
          manufacturer: 'Corellia Mining Corporation',
          length: '36.8',
          cost_in_credits: '150000',
          crew: '46',
          passengers: '30',
          max_atmosphering_speed: '30',
          cargo_capacity: '50000',
          consumables: '2 months',
        },
      ]);
    });
  });

  describe('getAllVehicles (Minimal Data Scenario)', () => {
    it('should return minimal data when no name/model filter is provided', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        results: [
          {
            uid: '2',
            name: 'X-34 landspeeder',
            url: 'https://www.swapi.tech/api/vehicles/2',
          },
        ],
      });

      const vehicles = await vehiclesService.getAllVehicles();
      expect(vehicles).toEqual([
        {
          id: '2',
          name: 'X-34 landspeeder',
          model: undefined,
          vehicle_class: undefined,
          manufacturer: undefined,
          length: undefined,
          cost_in_credits: undefined,
          crew: undefined,
          passengers: undefined,
          max_atmosphering_speed: undefined,
          cargo_capacity: undefined,
          consumables: undefined,
        },
      ]);
    });
  });

  describe('getVehicleById', () => {
    it('should return a single vehicle with full data', async () => {
      (swapiService.getResourceById as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: {
          uid: '3',
          properties: {
            name: 'T-16 skyhopper',
            model: 'T-16 skyhopper',
            vehicle_class: 'repulsorcraft',
            manufacturer: 'Incom Corporation',
            length: '10.4',
            cost_in_credits: '14500',
            crew: '1',
            passengers: '1',
            max_atmosphering_speed: '1200',
            cargo_capacity: '50',
            consumables: '0',
          },
        },
      });

      const vehicle = await vehiclesService.getVehicleById('3');
      expect(vehicle).toEqual({
        id: '3',
        name: 'T-16 skyhopper',
        model: 'T-16 skyhopper',
        vehicle_class: 'repulsorcraft',
        manufacturer: 'Incom Corporation',
        length: '10.4',
        cost_in_credits: '14500',
        crew: '1',
        passengers: '1',
        max_atmosphering_speed: '1200',
        cargo_capacity: '50',
        consumables: '0',
      });
    });
  });

  describe('applyFilters', () => {
    it('should filter vehicles by name and manufacturer', async () => {
      const vehicles = [
        {
          id: '4',
          name: 'Snowspeeder',
          model: 't-47 airspeeder',
          vehicle_class: 'airspeeder',
          manufacturer: 'Incom corporation',
          length: '4.5',
          cost_in_credits: 'unknown',
          crew: '2',
          passengers: '0',
          max_atmosphering_speed: '650',
          cargo_capacity: '10',
          consumables: 'none',
        },
        {
          id: '5',
          name: 'Imperial Speeder Bike',
          model: 'Speeder Bike',
          vehicle_class: 'speeder',
          manufacturer: 'Aratech Repulsor Company',
          length: '1.5',
          cost_in_credits: '8000',
          crew: '1',
          passengers: '1',
          max_atmosphering_speed: '360',
          cargo_capacity: '4',
          consumables: 'none',
        },
      ];

      const filter: VehicleFilterInput = {
        name: 'Snowspeeder',
        manufacturer: 'incom',
      };

      // @ts-ignore private method test
      const filtered = (vehiclesService as any).applyFilters(vehicles, filter);
      expect(filtered).toEqual([vehicles[0]]);
    });

    it('should filter vehicles with search term', () => {
      const vehicles = [
        {
          id: '4',
          name: 'Snowspeeder',
          model: 't-47 airspeeder',
          vehicle_class: 'airspeeder',
          manufacturer: 'Incom corporation',
          length: '4.5',
          cost_in_credits: 'unknown',
          crew: '2',
          passengers: '0',
          max_atmosphering_speed: '650',
          cargo_capacity: '10',
          consumables: 'none',
        },
        {
          id: '5',
          name: 'Imperial Speeder Bike',
          model: 'Speeder Bike',
          vehicle_class: 'speeder',
          manufacturer: 'Aratech Repulsor Company',
          length: '1.5',
          cost_in_credits: '8000',
          crew: '1',
          passengers: '1',
          max_atmosphering_speed: '360',
          cargo_capacity: '4',
          consumables: 'none',
        },
      ];

      const filter: VehicleFilterInput = { search: 'aratech' };
      // @ts-ignore
      const filtered = (vehiclesService as any).applyFilters(vehicles, filter);
      expect(filtered).toEqual([vehicles[1]]);
    });
  });

  describe('getAllVehiclesFullData', () => {
    it('should fetch minimal data and then full data for each vehicle', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        results: [
          { uid: '6', name: 'V-19 landspeeder', url: 'https://www.swapi.tech/api/vehicles/6' },
        ],
      });

      (swapiService.getResourceById as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: {
          uid: '6',
          properties: {
            name: 'V-19 landspeeder',
            model: 'V-19 model',
            vehicle_class: 'repulsorcraft',
            manufacturer: 'Corellia Mining Corporation',
            length: '5.5',
            cost_in_credits: '10000',
            crew: '1',
            passengers: '1',
            max_atmosphering_speed: '180',
            cargo_capacity: '20',
            consumables: '1 day',
          },
        },
      });

      const vehicles = await vehiclesService.getAllVehiclesFullData();
      expect(vehicles).toEqual([
        {
          id: '6',
          name: 'V-19 landspeeder',
          model: 'V-19 model',
          vehicle_class: 'repulsorcraft',
          manufacturer: 'Corellia Mining Corporation',
          length: '5.5',
          cost_in_credits: '10000',
          crew: '1',
          passengers: '1',
          max_atmosphering_speed: '180',
          cargo_capacity: '20',
          consumables: '1 day',
        },
      ]);
    });

    it('should use full data directly if name filter is provided', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: [
          {
            uid: '7',
            properties: {
              name: 'Zephyr-G swoop bike',
              model: 'Zephyr-G',
              vehicle_class: 'repulsorcraft',
              manufacturer: 'Baktoid Armor Workshop',
              length: '3.68',
              cost_in_credits: '2000',
              crew: '1',
              passengers: '1',
              max_atmosphering_speed: '250',
              cargo_capacity: '5',
              consumables: 'none',
            },
          },
        ],
      });

      const vehicles = await vehiclesService.getAllVehiclesFullData({ name: 'Zephyr-G swoop bike' });
      expect(vehicles).toEqual([
        {
          id: '7',
          name: 'Zephyr-G swoop bike',
          model: 'Zephyr-G',
          vehicle_class: 'repulsorcraft',
          manufacturer: 'Baktoid Armor Workshop',
          length: '3.68',
          cost_in_credits: '2000',
          crew: '1',
          passengers: '1',
          max_atmosphering_speed: '250',
          cargo_capacity: '5',
          consumables: 'none',
        },
      ]);
    });
  });
});
