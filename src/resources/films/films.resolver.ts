import { Resolver, Query, Args } from '@nestjs/graphql';
import { FilmsService } from './films.service';
import { Film } from './models/film.model';
import { FilmFilterInput } from './dto/film-filter.input';
import { FilmOpeningStats } from './models/film-opening-stats.model';

@Resolver(() => Film)
export class FilmsResolver {
  constructor(private readonly filmsService: FilmsService) {}

  @Query(() => [Film], { name: 'films' })
  async getFilms(@Args('filter', { nullable: true }) filter?: FilmFilterInput) {
    return this.filmsService.getAllFilms(filter?.search, filter?.page);
  }

  @Query(() => Film, { name: 'film' })
  async getFilm(@Args('id') id: string) {
    return this.filmsService.getFilmById(id);
  }

  @Query(() => FilmOpeningStats, { name: 'filmOpeningStats' })
  async getFilmOpeningStats() {
    return this.filmsService.getFilmOpeningStats();
  }
}
