import { Module } from '@nestjs/common';
import { SwapiModule } from '../../common/swapi/swapi.module';
import { StarshipsService } from './starships.service';
import { StarshipsResolver } from './starships.resolver';

@Module({
  imports: [SwapiModule],
  providers: [StarshipsService, StarshipsResolver],
})
export class StarshipsModule {}
