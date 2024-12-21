import { Test, TestingModule } from '@nestjs/testing';
import { SpeciesService } from '../resources/species/species.service';
import { SwapiService } from '../common/swapi/swapi.service';
import { SpeciesFilterInput } from '../resources/species/dto/species-filter.input';

describe('SpeciesService', () => {
  let speciesService: SpeciesService;
  let swapiService: SwapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeciesService,
        {
          provide: SwapiService,
          useValue: {
            getResourceList: jest.fn(),
            getResourceById: jest.fn(),
          },
        },
      ],
    }).compile();

    speciesService = module.get<SpeciesService>(SpeciesService);
    swapiService = module.get<SwapiService>(SwapiService);
  });

  describe('getAllSpecies (Full Data Scenario)', () => {
    it('should return full data when name filter is provided', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: [
          {
            uid: '1',
            properties: {
              name: 'Wookie',
              classification: 'Mammal',
              designation: 'Sentient',
              average_height: '210',
              average_lifespan: '400',
              eye_colors: 'blue, green, yellow, brown, golden, red',
              hair_colors: 'black, brown',
              skin_colors: 'gray',
              language: 'Shyriiwook',
            },
          },
        ],
      });

      const species = await speciesService.getAllSpecies({ name: 'Wookie' });
      expect(species).toEqual([
        {
          id: '1',
          name: 'Wookie',
          classification: 'Mammal',
          designation: 'Sentient',
          average_height: '210',
          average_lifespan: '400',
          eye_colors: 'blue, green, yellow, brown, golden, red',
          hair_colors: 'black, brown',
          skin_colors: 'gray',
          language: 'Shyriiwook',
        },
      ]);
    });
  });

  describe('getAllSpecies (Minimal Data Scenario)', () => {
    it('should return minimal data when no name filter is provided', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        results: [
          {
            uid: '2',
            name: 'Rodian',
            url: 'https://www.swapi.tech/api/species/2',
          },
        ],
      });

      const species = await speciesService.getAllSpecies();
      expect(species).toEqual([
        {
          id: '2',
          name: 'Rodian',
          classification: null,
          designation: null,
          average_height: null,
          average_lifespan: null,
          eye_colors: null,
          hair_colors: null,
          skin_colors: null,
          language: null,
        },
      ]);
    });
  });

  describe('getSpeciesById', () => {
    it('should return a single species with full data', async () => {
      (swapiService.getResourceById as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: {
          uid: '3',
          properties: {
            name: 'Hutt',
            classification: 'gastropod',
            designation: 'sentient',
            average_height: '300',
            average_lifespan: '1000',
            eye_colors: 'yellow, red',
            hair_colors: 'n/a',
            skin_colors: 'green, brown, tan',
            language: 'Huttese',
          },
        },
      });

      const species = await speciesService.getSpeciesById('3');
      expect(species).toEqual({
        id: '3',
        name: 'Hutt',
        classification: 'gastropod',
        designation: 'sentient',
        average_height: '300',
        average_lifespan: '1000',
        eye_colors: 'yellow, red',
        hair_colors: 'n/a',
        skin_colors: 'green, brown, tan',
        language: 'Huttese',
      });
    });
  });

  describe('applyFilters', () => {
    it('should filter species by name and classification', () => {
      const speciesList = [
        {
          id: '4',
          name: 'Ewok',
          classification: 'mammal',
          designation: 'sentient',
          average_height: '100',
          average_lifespan: 'unknown',
          eye_colors: 'orange, brown',
          hair_colors: 'brown, black, white',
          skin_colors: 'brown',
          language: 'Ewokese',
        },
        {
          id: '5',
          name: 'Twi\'lek',
          classification: 'mammals',
          designation: 'sentient',
          average_height: '200',
          average_lifespan: 'unknown',
          eye_colors: 'blue, brown, green, orange, pink',
          hair_colors: 'none',
          skin_colors: 'various',
          language: 'Twi\'leki',
        },
      ];

      const filter: SpeciesFilterInput = {
        name: 'Ewok',
        classification: 'mammal',
      };

      // @ts-ignore private method test
      const filtered = (speciesService as any).applyFilters(speciesList, filter);
      expect(filtered).toEqual([speciesList[0]]);
    });

    it('should filter species with a search term', () => {
      const speciesList = [
        {
          id: '4',
          name: 'Ewok',
          classification: 'mammal',
          designation: 'sentient',
          average_height: '100',
          average_lifespan: 'unknown',
          eye_colors: 'orange, brown',
          hair_colors: 'brown, black, white',
          skin_colors: 'brown',
          language: 'Ewokese',
        },
        {
          id: '5',
          name: 'Twi\'lek',
          classification: 'mammals',
          designation: 'sentient',
          average_height: '200',
          average_lifespan: 'unknown',
          eye_colors: 'blue, brown, green, orange, pink',
          hair_colors: 'none',
          skin_colors: 'various',
          language: 'Twi\'leki',
        },
      ];

      const filter: SpeciesFilterInput = { search: 'twi' };
      // @ts-ignore private method test
      const filtered = (speciesService as any).applyFilters(speciesList, filter);
      expect(filtered).toEqual([speciesList[1]]);
    });
  });

  describe('getAllSpeciesFullData', () => {
    it('should fetch minimal data and then full data for each species', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        results: [
          { uid: '6', name: 'Trandoshan', url: 'https://www.swapi.tech/api/species/6' },
        ],
      });

      (swapiService.getResourceById as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: {
          uid: '6',
          properties: {
            name: 'Trandoshan',
            classification: 'reptile',
            designation: 'sentient',
            average_height: '200',
            average_lifespan: 'unknown',
            eye_colors: 'yellow, red',
            hair_colors: 'none',
            skin_colors: 'brown, green',
            language: 'Dosh',
          },
        },
      });

      const species = await speciesService.getAllSpeciesFullData();
      expect(species).toEqual([
        {
          id: '6',
          name: 'Trandoshan',
          classification: 'reptile',
          designation: 'sentient',
          average_height: '200',
          average_lifespan: 'unknown',
          eye_colors: 'yellow, red',
          hair_colors: 'none',
          skin_colors: 'brown, green',
          language: 'Dosh',
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
              name: 'Gungan',
              classification: 'amphibian',
              designation: 'sentient',
              average_height: '190',
              average_lifespan: 'unknown',
              eye_colors: 'brown',
              hair_colors: 'none',
              skin_colors: 'brown, green',
              language: 'Gungan basic',
            },
          },
        ],
      });

      const species = await speciesService.getAllSpeciesFullData({ name: 'Gungan' });
      expect(species).toEqual([
        {
          id: '7',
          name: 'Gungan',
          classification: 'amphibian',
          designation: 'sentient',
          average_height: '190',
          average_lifespan: 'unknown',
          eye_colors: 'brown',
          hair_colors: 'none',
          skin_colors: 'brown, green',
          language: 'Gungan basic',
        },
      ]);
    });
  });
});
