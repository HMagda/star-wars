import { Resolver, Query, Args } from '@nestjs/graphql';
import { StarshipsService } from './starships.service';
import { Starship } from './models/starship.model';
import { StarshipFilterInput } from './dto/starship-filter.input';
import { PaginationInput } from '../common/dto/pagination.input';

@Resolver(() => Starship)
export class StarshipsResolver {
  constructor(private readonly starshipsService: StarshipsService) {}

  @Query(() => [Starship], { name: 'starships' })
  async getStarships(
    @Args('filter', { nullable: true }) filter?: StarshipFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<Starship[]> {
    return this.starshipsService.getAllStarships(filter, pagination);
  }

  @Query(() => [Starship], { name: 'starshipsFullData' })
  async getStarshipsFullData(
    @Args('filter', { nullable: true }) filter?: StarshipFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<Starship[]> {
    return this.starshipsService.getAllStarshipsFullData(filter, pagination);
  }

  @Query(() => Starship, { name: 'starship' })
  async getStarship(@Args('id') id: string): Promise<Starship> {
    return this.starshipsService.getStarshipById(id);
  }
}
