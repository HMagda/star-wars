import { Injectable, BadRequestException } from "@nestjs/common";
import { SwapiService } from "../../common/swapi/swapi.service";
import { StarshipFilterInput } from "./dto/starship-filter.input";
import { PaginationInput } from "../common/dto/pagination.input";
import { Starship } from "./models/starship.model";

interface MinimalStarship {
    uid: string;
    name: string;
    url: string;
}

interface StarshipProperties {
    uid: string;
    name: string;
    model: string;
    starship_class: string;
    manufacturer: string;
    cost_in_credits: string;
    length: string;
    crew: string;
    passengers: string;
    max_atmosphering_speed: string;
    hyperdrive_rating: string;
    MGLT: string;
    cargo_capacity: string;
    consumables: string;
}

@Injectable()
export class StarshipsService {
    constructor(private readonly swapiService: SwapiService) {}

    /**
     * This is an alternative implementation of the getAllStarships method that fetches full data for each starship.
     * It is provided as an example of how to fetch full data for each starship.
     * However, I recommended to use the getAllStarships method below, which fetches minimal data and only fetches full data for the requested starship(s).
     */
    async getAllStarshipsFullData(
        filter?: StarshipFilterInput,
        pagination?: PaginationInput,
    ) {
        const searchParam = filter?.name
            ? "name"
            : filter?.model
              ? "model"
              : undefined;
        const searchQuery = filter?.name ?? filter?.model;

        const data = await this.swapiService.getResourceList(
            "starships",
            searchParam,
            searchQuery,
            pagination?.page,
        );

        const isFullData = data.result && Array.isArray(data.result);

        if ((!data.results || data.results.length === 0) && !isFullData)
            return [];

        let starships: Starship[];

        if (isFullData) {
            starships = data.result.map(
                (s: {
                    properties: Omit<StarshipProperties, "uid">;
                    uid: string;
                }) => ({
                    id: s.uid,
                    name: s.properties.name,
                    model: s.properties.model,
                    starship_class: s.properties.starship_class,
                    manufacturer: s.properties.manufacturer,
                    cost_in_credits: s.properties.cost_in_credits,
                    length: s.properties.length,
                    crew: s.properties.crew,
                    passengers: s.properties.passengers,
                    max_atmosphering_speed: s.properties.max_atmosphering_speed,
                    hyperdrive_rating: s.properties.hyperdrive_rating,
                    MGLT: s.properties.MGLT,
                    cargo_capacity: s.properties.cargo_capacity,
                    consumables: s.properties.consumables,
                }),
            );
        } else {
            const uids = data.results.map((ms: MinimalStarship) => ms.uid);

            const requests = uids.map((uid: string) =>
                this.swapiService.getResourceById("starships", uid),
            );
            const responses = await Promise.all(requests);

            starships = responses.map((res) => {
                const props = res.result.properties;
                const uid = res.result.uid;
                return {
                    id: uid,
                    name: props.name,
                    model: props.model ?? null,
                    starship_class: props.starship_class ?? null,
                    manufacturer: props.manufacturer ?? null,
                    cost_in_credits: props.cost_in_credits ?? null,
                    length: props.length ?? null,
                    crew: props.crew ?? null,
                    passengers: props.passengers ?? null,
                    max_atmosphering_speed:
                        props.max_atmosphering_speed ?? null,
                    hyperdrive_rating: props.hyperdrive_rating ?? null,
                    MGLT: props.MGLT ?? null,
                    cargo_capacity: props.cargo_capacity ?? null,
                    consumables: props.consumables ?? null,
                };
            });
        }

        if (filter) {
            starships = this.applyFilters(starships, filter);
        }
        return starships;
    }

    async getAllStarships(
        filter?: StarshipFilterInput,
        pagination?: PaginationInput,
    ) {
        const searchParam = filter?.name
            ? "name"
            : filter?.model
              ? "model"
              : undefined;
        const searchQuery = filter?.name ?? filter?.model;

        const data = await this.swapiService.getResourceList(
            "starships",
            searchParam,
            searchQuery,
            pagination?.page,
        );

        const isFullData = data.result && Array.isArray(data.result);

        if ((!data.results || data.results.length === 0) && !isFullData)
            return [];

        let starships: Starship[];

        if (isFullData) {
            starships = data.result.map(
                (s: {
                    properties: Omit<StarshipProperties, "uid">;
                    uid: string;
                }) => ({
                    id: s.uid,
                    name: s.properties.name,
                    model: s.properties.model,
                    starship_class: s.properties.starship_class,
                    manufacturer: s.properties.manufacturer,
                    cost_in_credits: s.properties.cost_in_credits,
                    length: s.properties.length,
                    crew: s.properties.crew,
                    passengers: s.properties.passengers,
                    max_atmosphering_speed: s.properties.max_atmosphering_speed,
                    hyperdrive_rating: s.properties.hyperdrive_rating,
                    MGLT: s.properties.MGLT,
                    cargo_capacity: s.properties.cargo_capacity,
                    consumables: s.properties.consumables,
                }),
            );

            if (filter) {
                starships = this.applyFilters(starships, filter);
            }
        } else {
            const minimalStarships: MinimalStarship[] = data.results;
            starships = minimalStarships.map((ms) => ({
                id: ms.uid,
                name: ms.name,
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
            })) as unknown as Starship[];
        }

        return starships;
    }

    async getStarshipById(id: string) {
        const data = await this.swapiService.getResourceById("starships", id);
        const props = data?.result?.properties;

        return {
            id: id,
            name: props.name,
            model: props.model ?? null,
            starship_class: props.starship_class ?? null,
            manufacturer: props.manufacturer ?? null,
            cost_in_credits: props.cost_in_credits ?? null,
            length: props.length ?? null,
            crew: props.crew ?? null,
            passengers: props.passengers ?? null,
            max_atmosphering_speed: props.max_atmosphering_speed ?? null,
            hyperdrive_rating: props.hyperdrive_rating ?? null,
            MGLT: props.MGLT ?? null,
            cargo_capacity: props.cargo_capacity ?? null,
            consumables: props.consumables ?? null,
        };
    }

    private applyFilters(
        starships: Starship[],
        filter: StarshipFilterInput,
    ): Starship[] {
        let filteredStarships = starships;

        const search = filter.search?.toLowerCase();
        const name = filter.name?.toLowerCase();
        const model = filter.model?.toLowerCase();
        const starship_class = filter.starship_class?.toLowerCase();
        const manufacturer = filter.manufacturer?.toLowerCase();
        const cost_in_credits = filter.cost_in_credits?.toLowerCase();
        const length = filter.length?.toLowerCase();
        const crew = filter.crew?.toLowerCase();
        const passengers = filter.passengers?.toLowerCase();
        const max_atmosphering_speed =
            filter.max_atmosphering_speed?.toLowerCase();
        const hyperdrive_rating = filter.hyperdrive_rating?.toLowerCase();
        const MGLT = filter.MGLT?.toLowerCase();
        const cargo_capacity = filter.cargo_capacity?.toLowerCase();
        const consumables = filter.consumables?.toLowerCase();

        if (name) {
            filteredStarships = filteredStarships.filter((s) =>
                s.name?.toLowerCase().includes(name),
            );
        }
        if (model) {
            filteredStarships = filteredStarships.filter((s) =>
                s.model?.toLowerCase().includes(model),
            );
        }
        if (starship_class) {
            filteredStarships = filteredStarships.filter((s) =>
                s.starship_class?.toLowerCase().includes(starship_class),
            );
        }
        if (manufacturer) {
            filteredStarships = filteredStarships.filter((s) =>
                s.manufacturer?.toLowerCase().includes(manufacturer),
            );
        }
        if (cost_in_credits) {
            filteredStarships = filteredStarships.filter((s) =>
                s.cost_in_credits?.toLowerCase().includes(cost_in_credits),
            );
        }
        if (length) {
            filteredStarships = filteredStarships.filter((s) =>
                s.length?.toLowerCase().includes(length),
            );
        }
        if (crew) {
            filteredStarships = filteredStarships.filter((s) =>
                s.crew?.toLowerCase().includes(crew),
            );
        }
        if (passengers) {
            filteredStarships = filteredStarships.filter((s) =>
                s.passengers?.toLowerCase().includes(passengers),
            );
        }
        if (max_atmosphering_speed) {
            filteredStarships = filteredStarships.filter((s) =>
                s.max_atmosphering_speed
                    ?.toLowerCase()
                    .includes(max_atmosphering_speed),
            );
        }
        if (hyperdrive_rating) {
            filteredStarships = filteredStarships.filter((s) =>
                s.hyperdrive_rating?.toLowerCase().includes(hyperdrive_rating),
            );
        }
        if (MGLT) {
            filteredStarships = filteredStarships.filter((s) =>
                s.MGLT?.toLowerCase().includes(MGLT),
            );
        }
        if (cargo_capacity) {
            filteredStarships = filteredStarships.filter((s) =>
                s.cargo_capacity?.toLowerCase().includes(cargo_capacity),
            );
        }
        if (consumables) {
            filteredStarships = filteredStarships.filter((s) =>
                s.consumables?.toLowerCase().includes(consumables),
            );
        }

        if (search) {
            filteredStarships = filteredStarships.filter(
                (s) =>
                    (s.name && s.name.toLowerCase().includes(search)) ||
                    (s.model && s.model.toLowerCase().includes(search)) ||
                    (s.starship_class &&
                        s.starship_class.toLowerCase().includes(search)) ||
                    (s.manufacturer &&
                        s.manufacturer.toLowerCase().includes(search)) ||
                    (s.cost_in_credits &&
                        s.cost_in_credits.toLowerCase().includes(search)) ||
                    (s.length && s.length.toLowerCase().includes(search)) ||
                    (s.crew && s.crew.toLowerCase().includes(search)) ||
                    (s.passengers &&
                        s.passengers.toLowerCase().includes(search)) ||
                    (s.max_atmosphering_speed &&
                        s.max_atmosphering_speed
                            .toLowerCase()
                            .includes(search)) ||
                    (s.hyperdrive_rating &&
                        s.hyperdrive_rating.toLowerCase().includes(search)) ||
                    (s.MGLT && s.MGLT.toLowerCase().includes(search)) ||
                    (s.cargo_capacity &&
                        s.cargo_capacity.toLowerCase().includes(search)) ||
                    (s.consumables &&
                        s.consumables.toLowerCase().includes(search)),
            );
        }

        return filteredStarships;
    }
}
