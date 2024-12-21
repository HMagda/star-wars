import { Test, TestingModule } from '@nestjs/testing';
import { PlanetsService } from '../resources/planets/planets.service';
import { SwapiService } from '../common/swapi/swapi.service';
import { PlanetFilterInput } from '../resources/planets/dto/planet-filter.input';


describe('PlanetsService', () => {
  let planetsService: PlanetsService;
  let swapiService: SwapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanetsService,
        {
          provide: SwapiService,
          useValue: {
            getResourceList: jest.fn(),
            getResourceById: jest.fn(),
          },
        },
      ],
    }).compile();

    planetsService = module.get<PlanetsService>(PlanetsService);
    swapiService = module.get<SwapiService>(SwapiService);
  });

  describe('getAllPlanets (Full Data Scenario)', () => {
    it('should return full data when name filter is provided', async () => {
      // Mock SWAPI returning full data structure
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: [
          {
            properties: {
              name: 'Tatooine',
              diameter: '10465',
              rotation_period: '23',
              orbital_period: '304',
              gravity: '1 standard',
              population: '200000',
              climate: 'Arid',
              terrain: 'Desert',
              surface_water: '1',
              films: ['film1', 'film2'],
              residents: ['resident1', 'resident2'],
            },
            uid: '1',
          },
        ],
      });

      const planets = await planetsService.getAllPlanets({ name: 'Tatooine' });
      expect(planets).toEqual([
        {
          id: '1',
          name: 'Tatooine',
          diameter: '10465',
          rotation_period: '23',
          orbital_period: '304',
          gravity: '1 standard',
          population: '200000',
          climate: 'Arid',
          terrain: 'Desert',
          surface_water: '1',
          films: ['film1', 'film2'],
          residents: ['resident1', 'resident2'],
        },
      ]);
    });
  });

  describe('getAllPlanets (Minimal Data Scenario)', () => {
    it('should return minimal data when no name filter is provided', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        results: [
          {
            uid: '2',
            name: 'Alderaan',
            url: 'https://www.swapi.tech/api/planets/2',
          },
        ],
      });

      const planets = await planetsService.getAllPlanets();
      expect(planets).toEqual([
        {
          id: '2',
          name: 'Alderaan',
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
        },
      ]);
    });
  });

  describe('getPlanetById', () => {
    it('should return a single planet with full data', async () => {
      (swapiService.getResourceById as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: {
          uid: '3',
          properties: {
            name: 'Yavin IV',
            diameter: '10200',
            rotation_period: '24',
            orbital_period: '4818',
            gravity: '1 standard',
            population: '1000',
            climate: 'temperate, tropical',
            terrain: 'jungle, rainforests',
            surface_water: '8',
          },
        },
      });

      const planet = await planetsService.getPlanetById('3');
      expect(planet).toEqual({
        id: '3',
        name: 'Yavin IV',
        diameter: '10200',
        rotation_period: '24',
        orbital_period: '4818',
        gravity: '1 standard',
        population: '1000',
        climate: 'temperate, tropical',
        terrain: 'jungle, rainforests',
        surface_water: '8',
      });
    });
  });

  describe('applyFilters', () => {
    it('should filter planets by name and climate', async () => {
      const planets = [
        {
          id: '4',
          name: 'Hoth',
          diameter: '7200',
          rotation_period: '23',
          orbital_period: '549',
          gravity: '1.1 standard',
          population: 'unknown',
          climate: 'frozen',
          terrain: 'tundra, ice caves, mountain ranges',
          surface_water: '100',
          films: ['filmC'],
          residents: [],
        },
        {
          id: '5',
          name: 'Dagobah',
          diameter: '8900',
          rotation_period: '23',
          orbital_period: '341',
          gravity: 'N/A',
          population: 'unknown',
          climate: 'murky',
          terrain: 'swamp, jungles',
          surface_water: '8',
          films: [],
          residents: [],
        },
      ];

      const filter: PlanetFilterInput = {
        name: 'Hoth',
        climate: 'frozen',
      };

      // @ts-ignore private method test via reflective method call or test indirectly by getAllPlanets
      const filtered = (planetsService as any).applyFilters(planets, filter);
      expect(filtered).toEqual([planets[0]]);
    });

    it('should filter planets with search term', () => {
      const planets = [
        {
          id: '4',
          name: 'Hoth',
          diameter: '7200',
          rotation_period: '23',
          orbital_period: '549',
          gravity: '1.1 standard',
          population: 'unknown',
          climate: 'frozen',
          terrain: 'tundra, ice caves, mountain ranges',
          surface_water: '100',
          films: ['filmC'],
          residents: [],
        },
        {
          id: '5',
          name: 'Dagobah',
          diameter: '8900',
          rotation_period: '23',
          orbital_period: '341',
          gravity: 'N/A',
          population: 'unknown',
          climate: 'murky',
          terrain: 'swamp, jungles',
          surface_water: '8',
          films: [],
          residents: [],
        },
      ];

      const filter: PlanetFilterInput = { search: 'murk' };
      // @ts-ignore
      const filtered = (planetsService as any).applyFilters(planets, filter);
      expect(filtered).toEqual([planets[1]]);
    });
  });

  describe('getAllPlanetsFullData', () => {
    it('should fetch minimal data and then full data for each planet', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        results: [
          { uid: '6', name: 'Bespin', url: 'https://www.swapi.tech/api/planets/6' },
        ],
      });

      (swapiService.getResourceById as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: {
          uid: '6',
          properties: {
            name: 'Bespin',
            diameter: '118000',
            rotation_period: '12',
            orbital_period: '5110',
            gravity: '1.5 (surface), 1 standard (Cloud City)',
            population: '6000000',
            climate: 'temperate',
            terrain: 'gas giant',
            surface_water: '0',
            films: ['filmD'],
            residents: [],
          },
        },
      });

      const planets = await planetsService.getAllPlanetsFullData();
      expect(planets).toEqual([
        {
          id: '6',
          name: 'Bespin',
          diameter: '118000',
          rotation_period: '12',
          orbital_period: '5110',
          gravity: '1.5 (surface), 1 standard (Cloud City)',
          population: '6000000',
          climate: 'temperate',
          terrain: 'gas giant',
          surface_water: '0',
          films: ['filmD'],
          residents: [],
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
              name: 'Endor',
              diameter: '4900',
              rotation_period: '18',
              orbital_period: '402',
              gravity: '0.85 standard',
              population: '30000000',
              climate: 'temperate',
              terrain: 'forests, mountains, lakes',
              surface_water: 'unknown',
              films: ['filmE'],
              residents: [],
            },
          },
        ],
      });

      const planets = await planetsService.getAllPlanetsFullData({ name: 'Endor' });
      expect(planets).toEqual([
        {
          id: '7',
          name: 'Endor',
          diameter: '4900',
          rotation_period: '18',
          orbital_period: '402',
          gravity: '0.85 standard',
          population: '30000000',
          climate: 'temperate',
          terrain: 'forests, mountains, lakes',
          surface_water: 'unknown',
          films: ['filmE'],
          residents: [],
        },
      ]);
    });
  });
});
