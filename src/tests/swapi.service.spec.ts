import { Test, TestingModule } from '@nestjs/testing';

jest.mock('node-fetch', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

import fetch from 'node-fetch';
import { SwapiService } from '../common/swapi/swapi.service';
import { CacheService } from '../common/cache/cache.service';
import { CACHE_TTL } from '../common/cache/cache.constants';
const { Response } = jest.requireActual('node-fetch');

describe('SwapiService', () => {
  let swapiService: SwapiService;
  let cacheService: CacheService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwapiService,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    swapiService = module.get<SwapiService>(SwapiService);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getResourceList', () => {
    it('should return cached data if available', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue({ message: 'cached' });

      const data = await swapiService.getResourceList('people');
      expect(data).toEqual({ message: 'cached' });
      expect(cacheService.get).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch data if not in cache and set it', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (fetch as unknown as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify({ message: 'ok', results: [{ name: 'Luke' }] }))
      );

      const data = await swapiService.getResourceList('people');
      expect(data).toEqual({ message: 'ok', results: [{ name: 'Luke' }] });
      expect(cacheService.get).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.any(String),
        { message: 'ok', results: [{ name: 'Luke' }] },
        CACHE_TTL
      );
    });

    it('should handle multiple pages by fetching all in parallel', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      // Page 1 response
      (fetch as unknown as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify({
          message: 'ok',
          total_pages: 3,
          results: [{ name: 'Luke' }]
        }))
      );
      // Page 2 response
      (fetch as unknown as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify({
          message: 'ok',
          results: [{ name: 'Leia' }]
        }))
      );
      // Page 3 response
      (fetch as unknown as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify({
          message: 'ok',
          results: [{ name: 'Han' }]
        }))
      );

      const data = await swapiService.getResourceList('people');
      expect(data.results).toEqual([{ name: 'Luke' }, { name: 'Leia' }, { name: 'Han' }]);
      expect(fetch).toHaveBeenCalledTimes(3); // One for page 1, and two for subsequent pages in parallel
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should support search and pagination parameters', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (fetch as unknown as jest.Mock).mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'ok', results: [{ name: 'R2-D2' }] }))
      );

      const data = await swapiService.getResourceList('people', 'name', 'r2', 2);
      expect(fetch).toHaveBeenCalledWith(
        'https://www.swapi.tech/api/people/?name=r2&page=2&limit=10'
      );
      expect(data.results).toEqual([{ name: 'R2-D2' }]);
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('getResourceById', () => {
    it('should return cached data if available', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue({ message: 'cached-id' });

      const data = await swapiService.getResourceById('people', 1);
      expect(data).toEqual({ message: 'cached-id' });
      expect(cacheService.get).toHaveBeenCalledWith('resource:people:1');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch data if not in cache and set it', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (fetch as unknown as jest.Mock).mockResolvedValue(
        new Response(JSON.stringify({ message: 'ok', result: { uid: '1', properties: { name: 'Luke' } } }))
      );

      const data = await swapiService.getResourceById('people', '1');
      expect(data).toEqual({ message: 'ok', result: { uid: '1', properties: { name: 'Luke' } } });
      expect(fetch).toHaveBeenCalledWith('https://www.swapi.tech/api/people/1');
      expect(cacheService.set).toHaveBeenCalledWith(
        'resource:people:1',
        { message: 'ok', result: { uid: '1', properties: { name: 'Luke' } } },
        CACHE_TTL
      );
    });
  });
});
