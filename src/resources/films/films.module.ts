import { Module } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsResolver } from './films.resolver';
import { SwapiModule } from '../../common/swapi/swapi.module';

@Module({
  imports: [SwapiModule],
  providers: [FilmsService, FilmsResolver],
})
export class FilmsModule {}
