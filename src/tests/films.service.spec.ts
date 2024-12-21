import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from '../resources/films/films.service';
import { SpeciesService } from '../resources/species/species.service';
import { PlanetsService } from '../resources/planets/planets.service';
import { StarshipsService } from '../resources/starships/starships.service';
import { SwapiService } from '../common/swapi/swapi.service';
import { VehiclesService } from '../resources/vehicles/vehicles.service';

describe('FilmsService', () => {
  let filmsService: FilmsService;
  let swapiService: SwapiService;
  let speciesService: SpeciesService;
  let planetsService: PlanetsService;
  let starshipsService: StarshipsService;
  let vehiclesService: VehiclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: SwapiService,
          useValue: {
            getResourceList: jest.fn(),
            getResourceById: jest.fn(),
          },
        },
        {
          provide: SpeciesService,
          useValue: {
            getSpeciesById: jest.fn(),
          },
        },
        {
          provide: PlanetsService,
          useValue: {
            getPlanetById: jest.fn(),
          },
        },
        {
          provide: StarshipsService,
          useValue: {
            getStarshipById: jest.fn(),
          },
        },
        {
          provide: VehiclesService,
          useValue: {
            getVehicleById: jest.fn(),
          },
        },
      ],
    }).compile();

    filmsService = module.get<FilmsService>(FilmsService);
    swapiService = module.get<SwapiService>(SwapiService);
    speciesService = module.get<SpeciesService>(SpeciesService);
    planetsService = module.get<PlanetsService>(PlanetsService);
    starshipsService = module.get<StarshipsService>(StarshipsService);
    vehiclesService = module.get<VehiclesService>(VehiclesService);
  });

  describe('getAllFilms', () => {
    it('should return full data when title filter is provided', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: [
          {
            properties: {
              title: 'A New Hope',
              director: 'George Lucas',
              episode_id: 4,
              opening_crawl: 'It is a period of civil war...',
              producer: 'Gary Kurtz, Rick McCallum',
              release_date: '1977-05-25',
              planets: [],
              starships: [],
              vehicles: [],
              species: [],
            },
          },
        ],
      });

      const films = await filmsService.getAllFilms({ title: 'New' });
      expect(films).toEqual([
        {
          title: 'A New Hope',
          director: 'George Lucas',
          episode_id: 4,
          opening_crawl: 'It is a period of civil war...',
          producer: 'Gary Kurtz, Rick McCallum',
          release_date: '1977-05-25',
        },
      ]);
    });

    it('should filter films by director and search', async () => {
      (swapiService.getResourceList as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: [
          {
            properties: {
              title: 'The Empire Strikes Back',
              director: 'Irvin Kershner',
              episode_id: 5,
              opening_crawl: 'It is a dark time for the Rebellion...',
              producer: 'Gary Kurtz, George Lucas',
              release_date: '1980-05-17',
              planets: [],
              starships: [],
              vehicles: [],
              species: [],
            },
            uid: '2',
          },
          {
            properties: {
              title: 'Return of the Jedi',
              director: 'Richard Marquand',
              episode_id: 6,
              opening_crawl: 'Luke Skywalker has returned to his home planet...',
              producer: 'Howard G. Kazanjian, George Lucas, Rick McCallum',
              release_date: '1983-05-25',
              planets: [],
              starships: [],
              vehicles: [],
              species: [],
            },
            uid: '3',
          },
        ],
      });

      const films = await filmsService.getAllFilms({ director: 'irvin', search: 'dark' });
      expect(films).toEqual([
        {
          title: 'The Empire Strikes Back',
          director: 'Irvin Kershner',
          episode_id: 5,
          opening_crawl: 'It is a dark time for the Rebellion...',
          producer: 'Gary Kurtz, George Lucas',
          release_date: '1980-05-17',
        },
      ]);
    });
  });

  describe('getFilmById', () => {
    it('should return a single film with full related data', async () => {
      (swapiService.getResourceById as jest.Mock).mockResolvedValue({
        message: 'ok',
        result: {
          properties: {
            title: 'A New Hope',
            director: 'George Lucas',
            episode_id: 4,
            opening_crawl: 'It is a period of civil war...',
            producer: 'Gary Kurtz, Rick McCallum',
            release_date: '1977-05-25',
            species: ['https://www.swapi.tech/api/species/1/'],
            planets: ['https://www.swapi.tech/api/planets/1/'],
            starships: ['https://www.swapi.tech/api/starships/2/'],
            vehicles: ['https://www.swapi.tech/api/vehicles/4/'],
          },
          uid: '1',
        },
      });

      (speciesService.getSpeciesById as jest.Mock).mockResolvedValue({
        name: 'Human',
        classification: 'mammal',
        designation: 'sentient',
        average_height: '180',
        average_lifespan: '120',
        eye_colors: 'brown, blue',
        hair_colors: 'blond, brown',
        skin_colors: 'light, tan',
        language: 'Galactic Basic',
      });

      (planetsService.getPlanetById as jest.Mock).mockResolvedValue({
        name: 'Tatooine',
        diameter: '10465',
        rotation_period: '23',
        orbital_period: '304',
        gravity: '1 standard',
        population: '200000',
        climate: 'Arid',
        terrain: 'Desert',
        surface_water: '1',
      });

      (starshipsService.getStarshipById as jest.Mock).mockResolvedValue({
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
      });

      (vehiclesService.getVehicleById as jest.Mock).mockResolvedValue({
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
      });

      const film = await filmsService.getFilmById('1');
      expect(film).toEqual({
        title: 'A New Hope',
        director: 'George Lucas',
        episode_id: 4,
        opening_crawl: 'It is a period of civil war...',
        producer: 'Gary Kurtz, Rick McCallum',
        release_date: '1977-05-25',
        species: [
          {
            name: 'Human',
            classification: 'mammal',
            designation: 'sentient',
            average_height: '180',
            average_lifespan: '120',
            eye_colors: 'brown, blue',
            hair_colors: 'blond, brown',
            skin_colors: 'light, tan',
            language: 'Galactic Basic',
          },
        ],
        planets: [
          {
            name: 'Tatooine',
            diameter: '10465',
            rotation_period: '23',
            orbital_period: '304',
            gravity: '1 standard',
            population: '200000',
            climate: 'Arid',
            terrain: 'Desert',
            surface_water: '1',
          },
        ],
        starships: [
          {
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
        ],
        vehicles: [
          {
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
        ],
      });
    });
  });

  describe('getFilmOpeningStats', () => {
    it('should return word occurrences and most frequent character names', async () => {
      // Mock films
      (swapiService.getResourceList as jest.Mock).mockImplementation((resource: string) => {
        if (resource === 'films') {
          return Promise.resolve({
            result: [
              {
                properties: {
                  opening_crawl: 'It is a period of civil war. Luke Skywalker ... Luke Skywalker',
                  characters: ['https://www.swapi.tech/api/people/1/', 'https://www.swapi.tech/api/people/2/'],
                },
              },
              {
                properties: {
                  opening_crawl: '... Luke Skywalker is a hero ...',
                  characters: ['https://www.swapi.tech/api/people/1/'],
                },
              },
            ],
          });
        } else if (resource === 'people') {
          return Promise.resolve({
            results: [
              { uid: '1', name: 'Luke Skywalker' },
              { uid: '2', name: 'Darth Vader' },
            ],
          });
        }
      });

      const stats = await filmsService.getFilmOpeningStats();
      const lukeWords = stats.wordOccurrences.find(w => w.word === 'luke');
      const skywalkerWords = stats.wordOccurrences.find(w => w.word === 'skywalker');
      expect(lukeWords?.count).toBeGreaterThan(0);
      expect(skywalkerWords?.count).toBeGreaterThan(0);

      expect(stats.mostFrequentCharacterNames).toEqual(['Luke Skywalker']);
    });
  });
});
