import { Test, TestingModule } from '@nestjs/testing';
import { StarshipsService } from '../resources/starships/starships.service';
import { SwapiService } from '../common/swapi/swapi.service';
import { StarshipFilterInput } from '../resources/starships/dto/starship-filter.input';

describe('StarshipsService', () => {
  let starshipsService: StarshipsService;
  let swapiService: SwapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarshipsService,
        {
          provide: SwapiService,
          useValue: {
            getResourceList: jest.fn(),
            getResourceById: jest.fn(),
          },
        },
      ],
    }).compile();

    starshipsService = module.get<StarshipsService>(StarshipsService);
    swapiService = module.get<SwapiService>(SwapiService);
  });

  describe('getAllStarships (Full Data Scenario)', () => {
    it('should return full data when name filter is provided', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: [
          {
            uid: '1',
            properties: {
              name: 'X-wing',
              model: 'T-65 X-wing',
              starship_class: 'Starfighter',
              manufacturer: 'Incom Corporation',
              cost_in_credits: '149999',
              length: '12.5',
              crew: '1',
              passengers: '0',
              max_atmosphering_speed: '1050',
              hyperdrive_rating: '1.0',
              MGLT: '100',
              cargo_capacity: '110',
              consumables: '1 week',
            },
          },
        ],
      });

      const starships = await starshipsService.getAllStarships({ name: 'X-wing' });
      expect(starships).toEqual([
        {
          id: '1',
          name: 'X-wing',
          model: 'T-65 X-wing',
          starship_class: 'Starfighter',
          manufacturer: 'Incom Corporation',
          cost_in_credits: '149999',
          length: '12.5',
          crew: '1',
          passengers: '0',
          max_atmosphering_speed: '1050',
          hyperdrive_rating: '1.0',
          MGLT: '100',
          cargo_capacity: '110',
          consumables: '1 week',
        },
      ]);
    });
  });

  describe('getAllStarships (Minimal Data Scenario)', () => {
    it('should return minimal data when no name or model filter is provided', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        results: [
          {
            uid: '2',
            name: 'TIE Advanced x1',
            url: 'https://www.swapi.tech/api/starships/2',
          },
        ],
      });

      const starships = await starshipsService.getAllStarships();
      expect(starships).toEqual([
        {
          id: '2',
          name: 'TIE Advanced x1',
          model: null,
          starship_class: null,
          manufacturer: null,
          cost_in_credits: null,
          length: null,
          crew: null,
          passengers: null,
          max_atmosphering_speed: null,
          hyperdrive_rating: null,
          MGLT: null,
          cargo_capacity: null,
          consumables: null,
        },
      ]);
    });
  });

  describe('getStarshipById', () => {
    it('should return a single starship with full data', async () => {
      (swapiService.getResourceById as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: {
          uid: '3',
          properties: {
            name: 'Millennium Falcon',
            model: 'YT-1300 light freighter',
            starship_class: 'Light freighter',
            manufacturer: 'Corellian Engineering Corporation',
            cost_in_credits: '100000',
            length: '34.37',
            crew: '4',
            passengers: '6',
            max_atmosphering_speed: '1050',
            hyperdrive_rating: '0.5',
            MGLT: '75',
            cargo_capacity: '100000',
            consumables: '2 months',
          },
        },
      });

      const starship = await starshipsService.getStarshipById('3');
      expect(starship).toEqual({
        id: '3',
        name: 'Millennium Falcon',
        model: 'YT-1300 light freighter',
        starship_class: 'Light freighter',
        manufacturer: 'Corellian Engineering Corporation',
        cost_in_credits: '100000',
        length: '34.37',
        crew: '4',
        passengers: '6',
        max_atmosphering_speed: '1050',
        hyperdrive_rating: '0.5',
        MGLT: '75',
        cargo_capacity: '100000',
        consumables: '2 months',
      });
    });
  });

  describe('applyFilters', () => {
    it('should filter starships by name and manufacturer', () => {
      const starships = [
        {
          id: '4',
          name: 'Y-wing',
          model: 'BTL Y-wing',
          starship_class: 'assault starfighter/bomber',
          manufacturer: 'Koensayr Manufacturing',
          cost_in_credits: '134999',
          length: '14',
          crew: '2',
          passengers: '0',
          max_atmosphering_speed: '1000',
          hyperdrive_rating: '1.0',
          MGLT: '80',
          cargo_capacity: '110',
          consumables: '1 week',
        },
        {
          id: '5',
          name: 'TIE/ln space superiority starfighter',
          model: 'Twin Ion Engine/Ln Starfighter',
          starship_class: 'Starfighter',
          manufacturer: 'Sienar Fleet Systems',
          cost_in_credits: 'unknown',
          length: '6.4',
          crew: '1',
          passengers: '0',
          max_atmosphering_speed: '1200',
          hyperdrive_rating: null,
          MGLT: 'unknown',
          cargo_capacity: '65',
          consumables: '2 days',
        },
      ];

      const filter: StarshipFilterInput = {
        name: 'Y-wing',
        manufacturer: 'koensayr',
      };

      // @ts-ignore private method test
      const filtered = (starshipsService as any).applyFilters(starships, filter);
      expect(filtered).toEqual([starships[0]]);
    });

    it('should filter starships with search term', () => {
      const starships = [
        {
          id: '4',
          name: 'Y-wing',
          model: 'BTL Y-wing',
          starship_class: 'assault starfighter/bomber',
          manufacturer: 'Koensayr Manufacturing',
          cost_in_credits: '134999',
          length: '14',
          crew: '2',
          passengers: '0',
          max_atmosphering_speed: '1000',
          hyperdrive_rating: '1.0',
          MGLT: '80',
          cargo_capacity: '110',
          consumables: '1 week',
        },
        {
          id: '5',
          name: 'TIE/ln space superiority starfighter',
          model: 'Twin Ion Engine/Ln Starfighter',
          starship_class: 'Starfighter',
          manufacturer: 'Sienar Fleet Systems',
          cost_in_credits: 'unknown',
          length: '6.4',
          crew: '1',
          passengers: '0',
          max_atmosphering_speed: '1200',
          hyperdrive_rating: null,
          MGLT: 'unknown',
          cargo_capacity: '65',
          consumables: '2 days',
        },
      ];

      const filter: StarshipFilterInput = { search: 'sienar' };
      // @ts-ignore private method test
      const filtered = (starshipsService as any).applyFilters(starships, filter);
      expect(filtered).toEqual([starships[1]]);
    });
  });

  describe('getAllStarshipsFullData', () => {
    it('should fetch minimal data and then full data for each starship', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        results: [
          { uid: '6', name: 'A-wing', url: 'https://www.swapi.tech/api/starships/6' },
        ],
      });

      (swapiService.getResourceById as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: {
          uid: '6',
          properties: {
            name: 'A-wing',
            model: 'RZ-1 A-wing Interceptor',
            starship_class: 'starfighter',
            manufacturer: 'Alliance Underground Engineering, Incom Corporation',
            cost_in_credits: '175000',
            length: '9.6',
            crew: '1',
            passengers: '0',
            max_atmosphering_speed: '1300',
            hyperdrive_rating: '1.0',
            MGLT: 'unknown',
            cargo_capacity: '40',
            consumables: '1 week',
          },
        },
      });

      const starships = await starshipsService.getAllStarshipsFullData();
      expect(starships).toEqual([
        {
          id: '6',
          name: 'A-wing',
          model: 'RZ-1 A-wing Interceptor',
          starship_class: 'starfighter',
          manufacturer: 'Alliance Underground Engineering, Incom Corporation',
          cost_in_credits: '175000',
          length: '9.6',
          crew: '1',
          passengers: '0',
          max_atmosphering_speed: '1300',
          hyperdrive_rating: '1.0',
          MGLT: 'unknown',
          cargo_capacity: '40',
          consumables: '1 week',
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
              name: 'B-wing',
              model: 'A/SF-01 B-wing starfighter',
              starship_class: 'assault starfighter',
              manufacturer: 'Slayn & Korpil',
              cost_in_credits: '220000',
              length: '16.9',
              crew: '1',
              passengers: '0',
              max_atmosphering_speed: '950',
              hyperdrive_rating: '2.0',
              MGLT: '91',
              cargo_capacity: '45',
              consumables: '1 week',
            },
          },
        ],
      });

      const starships = await starshipsService.getAllStarshipsFullData({ name: 'B-wing' });
      expect(starships).toEqual([
        {
          id: '7',
          name: 'B-wing',
          model: 'A/SF-01 B-wing starfighter',
          starship_class: 'assault starfighter',
          manufacturer: 'Slayn & Korpil',
          cost_in_credits: '220000',
          length: '16.9',
          crew: '1',
          passengers: '0',
          max_atmosphering_speed: '950',
          hyperdrive_rating: '2.0',
          MGLT: '91',
          cargo_capacity: '45',
          consumables: '1 week',
        },
      ]);
    });
  });
});
