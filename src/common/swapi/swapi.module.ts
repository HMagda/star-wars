import { Module } from '@nestjs/common';
import { SwapiService } from './swapi.service';

@Module({
  providers: [SwapiService],
  exports: [SwapiService]
})
export class SwapiModule {}
