import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class VehicleFilterInput {
  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  vehicle_class?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  cost_in_credits?: string;

  @Field({ nullable: true })
  length?: string;

  @Field({ nullable: true })
  crew?: string;

  @Field({ nullable: true })
  passengers?: string;

  @Field({ nullable: true })
  max_atmosphering_speed?: string;

  @Field({ nullable: true })
  cargo_capacity?: string;

  @Field({ nullable: true })
  consumables?: string;
}
