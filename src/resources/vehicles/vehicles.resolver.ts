import { Resolver, Query, Args } from '@nestjs/graphql';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './models/vehicle.model';
import { VehicleFilterInput } from './dto/vehicle-filter.input';
import { PaginationInput } from '../common/dto/pagination.input';

@Resolver(() => Vehicle)
export class VehiclesResolver {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Query(() => [Vehicle], { name: 'vehicles' })
  async getVehicles(
    @Args('filter', { nullable: true }) filter?: VehicleFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput
  ): Promise<Vehicle[]> {
    return this.vehiclesService.getAllVehicles(filter, pagination);
  }

  @Query(() => Vehicle, { name: 'vehicle' })
  async getVehicle(@Args('id') id: string): Promise<Vehicle> {
    return this.vehiclesService.getVehicleById(id);
  }
}
