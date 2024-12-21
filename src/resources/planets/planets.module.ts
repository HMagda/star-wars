import { Module } from '@nestjs/common';
import { SwapiModule } from '../../common/swapi/swapi.module';
import { PlanetsService } from './planets.service';
import { PlanetsResolver } from './planets.resolver';

@Module({
  imports: [SwapiModule],
  providers: [PlanetsService, PlanetsResolver],
})
export class PlanetsModule {}
