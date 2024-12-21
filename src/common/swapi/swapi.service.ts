import { Injectable } from "@nestjs/common";
import fetch from "node-fetch";
import { CacheService } from "../cache/cache.service";
import { CACHE_TTL } from "../cache/cache.constants";

const BASE_URL = "https://www.swapi.tech/api";

@Injectable()
export class SwapiService {
    constructor(private cacheService: CacheService) {}

    async getResourceList(
        resource: string,
        searchParam?: string,
        searchQuery?: string,
        page?: number,
    ): Promise<any> {
        const query = new URLSearchParams();
        if (searchParam && searchQuery) query.set(searchParam, searchQuery);
        if (page) {
            query.set("page", page.toString());
            query.set("limit", "10");
        }
    
        const url = `${BASE_URL}/${resource}/?${query.toString()}`;
        const cacheKey = `list:${resource}:${searchParam || ""}:${searchQuery || ""}:${page || 0}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) return cached;
    
        const res = await fetch(url);
        const data: any = await res.json();
        const totalPages = data?.total_pages ? parseInt(data.total_pages) : 1;
    
        if (!page && totalPages > 1) {
            const allResults = [...(data.results || [])];
    
            const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
            const promises = pageNumbers.map((p) =>
                this.getResourceList(resource, searchParam, searchQuery, p)
            );
    
            const allPagesData = await Promise.all(promises);
    
            for (const pageData of allPagesData) {
                if (pageData.results) {
                    allResults.push(...pageData.results);
                }
            }
    
            data.results = allResults;
        }
    
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
