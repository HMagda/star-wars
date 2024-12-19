import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { CacheService } from '../cache/cache.service';
import { CACHE_TTL } from '../cache/cache.constants';

const BASE_URL = 'https://www.swapi.tech/api';

@Injectable()
export class SwapiService {
  constructor(private cacheService: CacheService) {}

  async getResourceList(resource: string, search?: string, page?: number): Promise<any> {
    const query = new URLSearchParams();
    if (search) query.set('name', search);
    if (page) query.set('page', page.toString());

    const url = `${BASE_URL}/${resource}/?${query.toString()}`;
    const cacheKey = `list:${resource}:${search || ''}:${page || 1}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const res = await fetch(url);
    const data = await res.json();
    await this.cacheService.set(cacheKey, data, CACHE_TTL);
    return data;
  }

  async getResourceById(resource: string, id: string | number): Promise<any> {
    const cacheKey = `resource:${resource}:${id}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/${resource}/${id}`;
    const res = await fetch(url);
    const data = await res.json();
    await this.cacheService.set(cacheKey, data, CACHE_TTL);
    return data;
  }
}
