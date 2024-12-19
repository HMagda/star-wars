import {Injectable} from '@nestjs/common';
import {SwapiService} from '../../common/swapi/swapi.service';
import {Film} from './models/film.model';
import {FilmOpeningStats} from './models/film-opening-stats.model';

interface FilmProperties {
    title: string;
    director: string;
    episode_id: number;
    opening_crawl: string;
    producer: string;
    release_date: string;
    characters: string[];
}

@Injectable()
export class FilmsService {
    constructor(private readonly swapiService: SwapiService) {}

    async getAllFilms(search?: string, page?: number): Promise<Film[]> {
        const data = await this.swapiService.getResourceList(
            'films',
            search,
            page
        );
        return data.result.map((film: {properties: FilmProperties}) => ({
            title: film.properties.title,
            director: film.properties.director,
            episode_id: film.properties.episode_id,
            opening_crawl: film.properties.opening_crawl,
            producer: film.properties.producer,
            release_date: film.properties.release_date,
        }));
    }

    async getFilmById(id: string): Promise<Film> {
        const data = await this.swapiService.getResourceById('films', id);
        const film = data.result.properties;
        return {
            title: film.title,
            director: film.director,
            episode_id: film.episode_id,
            opening_crawl: film.opening_crawl,
            producer: film.producer,
            release_date: film.release_date,
        };
    }

    async getFilmOpeningStats(): Promise<FilmOpeningStats> {
        const data = await this.swapiService.getResourceList('films');

        if (!data.result || !Array.isArray(data.result)) {
            throw new Error('Unexpected response format from SWAPI');
        }

        const wordOccurrences = new Map<string, number>();
        const characterMentions = new Map<string, number>();

        for (const film of data.result) {
            const openingCrawl = film?.properties?.opening_crawl?.toLowerCase();
            const characters = film?.properties?.characters;

            if (!openingCrawl || !characters) continue;

            // Count word occurrences
            const words = openingCrawl
                .replace(/[^a-z\s]/g, '')
                .split(/\s+/)
                .filter((word: string | any[]) => word.length > 0);

            for (const word of words) {
                wordOccurrences.set(word, (wordOccurrences.get(word) || 0) + 1);
            }

            // Count character mentions
            for (const characterUrl of characters) {
                const characterId = characterUrl.match(/\/(\d+)\/$/)?.[1];
                if (characterId) {
                    try {
                        const characterData =
                            await this.swapiService.getResourceById(
                                'people',
                                characterId
                            );
                        const name =
                            characterData?.result?.properties?.name?.toLowerCase();

                        if (name) {
                            const nameParts = name.split(' ');

                            // Check for full name or partial match
                            const isMentioned =
                                openingCrawl.includes(name) ||
                                nameParts.some((part: any) =>
                                    openingCrawl.includes(part)
                                );

                            if (isMentioned) {
                                characterMentions.set(
                                    name,
                                    (characterMentions.get(name) || 0) + 1
                                );
                                console.log(
                                    `Matched character: ${name} in opening crawl.`
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            `Failed to fetch character with ID ${characterId}:`,
                            error
                        );
                    }
                }
            }
        }

        const mostFrequentCount = Math.max(...characterMentions.values(), 0);
        const mostFrequentCharacterNames = Array.from(
            characterMentions.entries()
        )
            .filter(([_, count]) => count === mostFrequentCount)
            .map(([name]) => name);

        console.log(
            'Character Mentions:',
            Array.from(characterMentions.entries())
        );

        return {
            wordOccurrences: Array.from(wordOccurrences.entries()).map(
                ([word, count]) => ({
                    word,
                    count,
                })
            ),
            mostFrequentCharacterNames,
        };
    }
}
