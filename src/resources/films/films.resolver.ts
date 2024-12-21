import { Resolver, Query, Args } from '@nestjs/graphql';
import { FilmsService } from './films.service';
import { Film } from './models/film.model';
import { FilmFilterInput } from './dto/film-filter.input';
import { FilmOpeningStats } from './models/film-opening-stats.model';
import { PaginationInput } from '../common/dto/pagination.input';

@Resolver(() => Film)
export class FilmsResolver {
  constructor(private readonly filmsService: FilmsService) {}

  @Query(() => [Film], { name: 'films' })
  async getFilms(
    @Args('filter', { nullable: true }) filter?: FilmFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.filmsService.getAllFilms(filter, pagination);
  }

  @Query(() => Film, { name: 'film', nullable: true })
  async getFilm(@Args('id') id: string): Promise<Film | null> {
    return this.filmsService.getFilmById(id);
  }

  @Query(() => FilmOpeningStats, { name: 'filmOpeningStats' })
  async getFilmOpeningStats() {
    return this.filmsService.getFilmOpeningStats();
  }
}
