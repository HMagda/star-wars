import { Injectable } from '@nestjs/common';
import { SwapiService } from '../../common/swapi/swapi.service';
import { SpeciesFilterInput } from './dto/species-filter.input';
import { PaginationInput } from '../common/dto/pagination.input';

interface MinimalSpecies {
  uid: string;
  name: string;
  url: string;
}

interface SpeciesProperties {
  name: string;
  classification: string;
  designation: string;
  average_height: string;
  average_lifespan: string;
  eye_colors: string;
  hair_colors: string;
  skin_colors: string;
  language: string;
}

interface Species {
  id: string;
  name: string;
  classification: string | null;
  designation: string | null;
  average_height: string | null;
  average_lifespan: string | null;
  eye_colors: string | null;
  hair_colors: string | null;
  skin_colors: string | null;
  language: string | null;
}

@Injectable()
export class SpeciesService {
  constructor(private readonly swapiService: SwapiService) {}

  /**
   * This is an alternative implementation similar to what we have for starships and vehicles,
   * allowing full data retrieval even without a 'name' filter by making multiple calls if needed.
   */
  async getAllSpeciesFullData(
    filter?: SpeciesFilterInput,
    pagination?: PaginationInput,
  ): Promise<Species[]> {
    const searchParam = filter?.name ? 'name' : undefined;
    const searchQuery = filter?.name;

    const data = await this.swapiService.getResourceList('species', searchParam, searchQuery, pagination?.page);

    const isFullData = data.result && Array.isArray(data.result);
    if ((!data.results || data.results.length === 0) && !isFullData) return [];

    let species: Species[];

    if (isFullData) {
      species = data.result.map((sp: { properties: SpeciesProperties; uid: string }) => ({
        id: sp.uid,
        name: sp.properties.name,
        classification: sp.properties.classification ?? null,
        designation: sp.properties.designation ?? null,
        average_height: sp.properties.average_height ?? null,
        average_lifespan: sp.properties.average_lifespan ?? null,
        eye_colors: sp.properties.eye_colors ?? null,
        hair_colors: sp.properties.hair_colors ?? null,
        skin_colors: sp.properties.skin_colors ?? null,
        language: sp.properties.language ?? null,
      }));
    } else {
      const minimalSpecies: MinimalSpecies[] = data.results;
      const uids = minimalSpecies.map((ms) => ms.uid);

      // Fetch full details in parallel
      const requests = uids.map((uid: string) => this.swapiService.getResourceById('species', uid));
      const responses = await Promise.all(requests);

      species = responses.map((res) => {
        const props = res.result.properties;
        const uid = res.result.uid;
        return {
          id: uid,
          name: props.name,
          classification: props.classification ?? null,
          designation: props.designation ?? null,
          average_height: props.average_height ?? null,
          average_lifespan: props.average_lifespan ?? null,
          eye_colors: props.eye_colors ?? null,
          hair_colors: props.hair_colors ?? null,
          skin_colors: props.skin_colors ?? null,
          language: props.language ?? null,
        };
      });
    }

    if (filter) {
      species = this.applyFilters(species, filter);
    }

    return species;
  }

  async getAllSpecies(
    filter?: SpeciesFilterInput,
    pagination?: PaginationInput,
  ): Promise<Species[]> {
    const searchParam = filter?.name ? 'name' : undefined;
    const searchQuery = filter?.name;

    const data = await this.swapiService.getResourceList('species', searchParam, searchQuery, pagination?.page);

    const isFullData = data.result && Array.isArray(data.result);

    if ((!data.results || data.results.length === 0) && !isFullData) return [];

    let species: Species[];

    if (isFullData) {
      species = data.result.map((sp: { properties: SpeciesProperties; uid: string }) => ({
        id: sp.uid,
        name: sp.properties.name,
        classification: sp.properties.classification ?? null,
        designation: sp.properties.designation ?? null,
        average_height: sp.properties.average_height ?? null,
        average_lifespan: sp.properties.average_lifespan ?? null,
        eye_colors: sp.properties.eye_colors ?? null,
        hair_colors: sp.properties.hair_colors ?? null,
        skin_colors: sp.properties.skin_colors ?? null,
        language: sp.properties.language ?? null,
      }));

      if (filter) {
        species = this.applyFilters(species, filter);
      }
    } else {
      const minimalSpecies: MinimalSpecies[] = data.results;
      species = minimalSpecies.map((ms) => ({
        id: ms.uid,
        name: ms.name,
        classification: null,
        designation: null,
        average_height: null,
        average_lifespan: null,
        eye_colors: null,
        hair_colors: null,
        skin_colors: null,
        language: null,
      })) as Species[];
    }

    return species;
  }

  async getSpeciesById(id: string): Promise<Species | null> {
    const data = await this.swapiService.getResourceById('species', id);
    const props = data?.result?.properties;

    return {
      id: data.result.uid,
      name: props.name,
      classification: props.classification ?? null,
      designation: props.designation ?? null,
      average_height: props.average_height ?? null,
      average_lifespan: props.average_lifespan ?? null,
      eye_colors: props.eye_colors ?? null,
      hair_colors: props.hair_colors ?? null,
      skin_colors: props.skin_colors ?? null,
      language: props.language ?? null,
    };
  }

  private applyFilters(species: Species[], filter: SpeciesFilterInput): Species[] {
    let filteredSpecies = species;

    const search = filter.search?.toLowerCase();
    const name = filter.name?.toLowerCase();
    const classification = filter.classification?.toLowerCase();
    const designation = filter.designation?.toLowerCase();
    const average_height = filter.average_height?.toLowerCase();
    const average_lifespan = filter.average_lifespan?.toLowerCase();
    const eye_colors = filter.eye_colors?.toLowerCase();
    const hair_colors = filter.hair_colors?.toLowerCase();
    const skin_colors = filter.skin_colors?.toLowerCase();
    const language = filter.language?.toLowerCase();

    if (name) {
      filteredSpecies = filteredSpecies.filter(s =>
        s.name?.toLowerCase().includes(name)
      );
    }
    if (classification) {
      filteredSpecies = filteredSpecies.filter(s =>
        s.classification?.toLowerCase().includes(classification)
      );
    }
    if (designation) {
      filteredSpecies = filteredSpecies.filter(s =>
        s.designation?.toLowerCase().includes(designation)
      );
    }
    if (average_height) {
      filteredSpecies = filteredSpecies.filter(s =>
        s.average_height?.toLowerCase().includes(average_height)
      );
    }
    if (average_lifespan) {
      filteredSpecies = filteredSpecies.filter(s =>
        s.average_lifespan?.toLowerCase().includes(average_lifespan)
      );
    }
    if (eye_colors) {
      filteredSpecies = filteredSpecies.filter(s =>
        s.eye_colors?.toLowerCase().includes(eye_colors)
      );
    }
    if (hair_colors) {
      filteredSpecies = filteredSpecies.filter(s =>
        s.hair_colors?.toLowerCase().includes(hair_colors)
      );
    }
    if (skin_colors) {
      filteredSpecies = filteredSpecies.filter(s =>
        s.skin_colors?.toLowerCase().includes(skin_colors)
      );
    }
    if (language) {
      filteredSpecies = filteredSpecies.filter(s =>
        s.language?.toLowerCase().includes(language)
      );
    }

    if (search) {
      filteredSpecies = filteredSpecies.filter(s =>
        (s.name && s.name.toLowerCase().includes(search)) ||
        (s.classification && s.classification.toLowerCase().includes(search)) ||
        (s.designation && s.designation.toLowerCase().includes(search)) ||
        (s.average_height && s.average_height.toLowerCase().includes(search)) ||
        (s.average_lifespan && s.average_lifespan.toLowerCase().includes(search)) ||
        (s.eye_colors && s.eye_colors.toLowerCase().includes(search)) ||
        (s.hair_colors && s.hair_colors.toLowerCase().includes(search)) ||
        (s.skin_colors && s.skin_colors.toLowerCase().includes(search)) ||
        (s.language && s.language.toLowerCase().includes(search))
      );
    }

    return filteredSpecies;
  }
}
