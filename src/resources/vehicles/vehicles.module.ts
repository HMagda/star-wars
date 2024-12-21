import { Module } from '@nestjs/common';
import { SwapiModule } from '../../common/swapi/swapi.module';
import { VehiclesService } from './vehicles.service';
import { VehiclesResolver } from './vehicles.resolver';

@Module({
  imports: [SwapiModule],
  providers: [VehiclesService, VehiclesResolver],
})
export class VehiclesModule {}
