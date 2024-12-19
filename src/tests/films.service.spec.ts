import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from '../resources/films/films.service';
import { SwapiService } from '../common/swapi/swapi.service';
import { CacheService } from '../common/cache/cache.service';

describe('FilmsService', () => {
  let service: FilmsService;
  let swapiService: SwapiService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        SwapiService,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    swapiService = module.get<SwapiService>(SwapiService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
