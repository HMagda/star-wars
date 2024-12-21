import { Module } from '@nestjs/common';
import { SwapiModule } from '../../common/swapi/swapi.module';
import { SpeciesService } from './species.service';
import { SpeciesResolver } from './species.resolver';

@Module({
  imports: [SwapiModule],
  providers: [SpeciesService, SpeciesResolver],
})
export class SpeciesModule {}
