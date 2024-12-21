import { Module, forwardRef } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsResolver } from './films.resolver';
import { SwapiModule } from '../../common/swapi/swapi.module';
import { SpeciesModule } from '../species/species.module';
import { PlanetsModule } from '../planets/planets.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { StarshipsModule } from '../starships/starships.module';
import { SwapiService } from '../../common/swapi/swapi.service';
import { SpeciesService } from '../species/species.service';
import { PlanetsService } from '../planets/planets.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { StarshipsService } from '../starships/starships.service';
import { PlanetsResolver } from '../planets/planets.resolver';

@Module({
  imports: [SwapiModule, SpeciesModule, forwardRef(() => PlanetsModule), VehiclesModule, StarshipsModule],
  providers: [FilmsService, FilmsResolver, SwapiService, SpeciesService, PlanetsService, VehiclesService, StarshipsService],
  exports: [FilmsService],

})
export class FilmsModule {}
