import { Injectable } from "@nestjs/common";
import { SwapiService } from "../../common/swapi/swapi.service";
import { Film } from "./models/film.model";
import { FilmOpeningStats } from "./models/film-opening-stats.model";
import { FilmFilterInput } from "./dto/film-filter.input";
import { PaginationInput } from "../common/dto/pagination.input";
import { SpeciesService } from "../species/species.service";
import { PlanetsService } from "../planets/planets.service";
import { StarshipsService } from "../starships/starships.service";
import { VehiclesService } from "../vehicles/vehicles.service";
import { Species } from "../species/models/species.model";
import { Planet } from "../planets/models/planet.model";

interface FilmProperties {
    title: string;
    director: string;
    episode_id: number;
    opening_crawl: string;
    producer: string;
    release_date: string;
    planets: string[];
    starships: string[];
    vehicles: string[];
    species: string[];
}

function normalizeText(text: string): string[] {
    return text
        .replace(/[^a-z0-9\s]/gi, " ")
        .split(/\s+/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length > 0);
}

function extractIdsFromUrls(urls: string[]): string[] {
    return urls
        .map((url) => url.match(/\/(\d+)\/?$/)?.[1])
        .filter((id): id is string => !!id);
}

@Injectable()
export class FilmsService {
    private characterNameCache = new Map<string, string>(); // cache character names by ID

    constructor(
        private readonly swapiService: SwapiService,
        private readonly speciesService: SpeciesService,
        private readonly planetsService: PlanetsService,
        private readonly starshipsService: StarshipsService,
        private readonly vehiclesService: VehiclesService
    ) {}
    async getAllFilms(filter?: FilmFilterInput, pagination?: PaginationInput): Promise<Film[]> {
        const titleSearch = filter?.title;
        const data = await this.swapiService.getResourceList("films", titleSearch ? "title" : undefined, titleSearch, pagination?.page);

        if (!data.result) return [];

        let films = data.result.map((film: { properties: FilmProperties }) => ({
            title: film.properties.title,
            director: film.properties.director,
            episode_id: film.properties.episode_id,
            opening_crawl: film.properties.opening_crawl,
            producer: film.properties.producer,
            release_date: film.properties.release_date,
        }));

        if (filter) {
            films = this.applyFilters(films, filter);
        }

        return films;
    }

    async getFilmById(id: string): Promise<Film | null> {
        const data = await this.swapiService.getResourceById("films", id);
        if (!data.result) {
            return null;
        }
        
        const film = data.result.properties;

        const speciesIds = extractIdsFromUrls(film.species);
        const planetIds = extractIdsFromUrls(film.planets);
        const starshipIds = extractIdsFromUrls(film.starships);
        const vehicleIds = extractIdsFromUrls(film.vehicles);

        // Fetch all related data in parallel
        const [speciesData, planetsData, starshipsData, vehiclesData] = await Promise.all([
            Promise.all(speciesIds.map((sid) => this.speciesService.getSpeciesById(sid))),
            Promise.all(planetIds.map((pid) => this.planetsService.getPlanetById(pid))),
            Promise.all(starshipIds.map((stid) => this.starshipsService.getStarshipById(stid))),
            Promise.all(vehicleIds.map((vid) => this.vehiclesService.getVehicleById(vid))),
        ]);

        return {
            title: film.title,
            director: film.director,
            episode_id: film.episode_id,
            opening_crawl: film.opening_crawl,
            producer: film.producer,
            release_date: film.release_date,
            species: speciesData.filter(Boolean) as Species[],
            planets: planetsData.filter(Boolean) as Planet[],
            starships: starshipsData.filter(Boolean),
            vehicles: vehiclesData.filter(Boolean),
        };
    }

    async getFilmOpeningStats(): Promise<FilmOpeningStats> {
        const data = await this.swapiService.getResourceList("films");
        if (!data.result || !Array.isArray(data.result)) {
            throw new Error("Unexpected response format from SWAPI");
        }

        const wordOccurrences = new Map<string, number>();
        const characterMentions = new Map<string, number>();
        const allCharacterNames = await this.getAllCharacterNames();

        for (const film of data.result) {
            const openingCrawl = film?.properties?.opening_crawl;
            const characters = film?.properties?.characters;
            if (!openingCrawl || !characters) continue;

            const crawlWords = normalizeText(openingCrawl);

            for (const word of crawlWords) {
                wordOccurrences.set(word, (wordOccurrences.get(word) || 0) + 1);
            }

            for (const characterUrl of characters) {
                const characterId = characterUrl.match(/\/(\d+)\/?$/)?.[1];
                if (!characterId) continue;

                const charName = allCharacterNames.get(parseInt(characterId));
                if (!charName) continue;

                const charNameWords = normalizeText(charName);
                if (charNameWords.length === 0) continue;

                let count = 0;
                for (
                    let i = 0;
                    i <= crawlWords.length - charNameWords.length;
                    i++
                ) {
                    const segment = crawlWords.slice(
                        i,
                        i + charNameWords.length,
                    );
                    if (segment.join(" ") === charNameWords.join(" ")) {
                        count++;
                    }
                }

                if (count > 0) {
                    characterMentions.set(
                        charName,
                        (characterMentions.get(charName) || 0) + count,
                    );
                }
            }
        }

        const maxCount = Math.max(0, ...Array.from(characterMentions.values()));
        const mostFrequentCharacterNames = Array.from(
            characterMentions.entries(),
        )
            .filter(([_, cnt]) => cnt === maxCount)
            .map(([name]) => name);


        return {
            wordOccurrences: Array.from(wordOccurrences.entries())
                .map(([word, count]) => ({
                    word,
                    count,
                }))
                .sort((a, b) => {
                    if (b.count !== a.count) {
                        return b.count - a.count;
                    }
                    return a.word.localeCompare(b.word);
                }),
            mostFrequentCharacterNames,
        };
    }

    private async getAllCharacterNames(): Promise<Map<number, string>> {
        const characterNames = new Map<number, string>();
        const data = await this.swapiService.getResourceList("people");
        let characters = data.results;
        for (const character of characters) {
            const charId = parseInt(character?.uid);
            const charName = character?.name;
            if (!charId || !charName) continue;
            characterNames.set(charId, charName);
        }
        return characterNames;
    }

    private applyFilters(films: Film[], filter: FilmFilterInput): Film[] {
        let filteredFilms = films;

        const search = filter.search?.toLowerCase();
        const title = filter.title?.toLowerCase();
        const director = filter.director?.toLowerCase();
        const producer = filter.producer?.toLowerCase();
        const opening_crawl = filter.opening_crawl?.toLowerCase();

        if (title) {
            filteredFilms = filteredFilms.filter((f) =>
                f.title.toLowerCase().includes(title),
            );
        }

        if (filter.episode_id !== undefined) {
            filteredFilms = filteredFilms.filter(
                (f) => f.episode_id === filter.episode_id,
            );
        }

        if (director) {
            filteredFilms = filteredFilms.filter((f) =>
                f.director.toLowerCase().includes(director),
            );
        }

        if (producer) {
            filteredFilms = filteredFilms.filter((f) =>
                f.producer.toLowerCase().includes(producer),
            );
        }

        if (opening_crawl) {
            filteredFilms = filteredFilms.filter((f) =>
                f.opening_crawl.toLowerCase().includes(opening_crawl),
            );
        }

        if (search) {
            filteredFilms = filteredFilms.filter(
                (f) =>
                    f.title.toLowerCase().includes(search) ||
                    f.director.toLowerCase().includes(search) ||
                    f.producer.toLowerCase().includes(search) ||
                    f.opening_crawl.toLowerCase().includes(search),
            );
        }

        return filteredFilms;
    }
}
