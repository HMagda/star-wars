import { Resolver, Query, Args } from '@nestjs/graphql';
import { PlanetsService } from './planets.service';
import { Planet } from './models/planet.model';
import { PlanetFilterInput } from './dto/planet-filter.input';
import { PaginationInput } from '../common/dto/pagination.input';

@Resolver(() => Planet)
export class PlanetsResolver {
  constructor(private readonly planetsService: PlanetsService) {}

  @Query(() => [Planet], { name: 'planets' })
  async getPlanets(
    @Args('filter', { nullable: true }) filter?: PlanetFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<Planet[]> {
    return this.planetsService.getAllPlanets(filter, pagination);
  }

  @Query(() => [Planet], { name: 'planets' })
  async getPlanetsFullData(
    @Args('filter', { nullable: true }) filter?: PlanetFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<Planet[]> {
    return this.planetsService.getAllPlanetsFullData(filter, pagination);
  }

  @Query(() => Planet, { name: 'planet', nullable: true })
  async getPlanet(@Args('id') id: string): Promise<Planet | null> {
    return this.planetsService.getPlanetById(id);
  }
}
