import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Vehicle {

  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  model?: string;

  @Field(() => String, { nullable: true })
  vehicle_class?: string;

  @Field(() => String, { nullable: true })
  manufacturer?: string;

  @Field(() => String, { nullable: true })
  length?: string;

  @Field(() => String, { nullable: true })
  cost_in_credits?: string;

  @Field(() => String, { nullable: true })
  crew?: string;

  @Field(() => String, { nullable: true })
  passengers?: string;

  @Field(() => String, { nullable: true })
  max_atmosphering_speed?: string;

  @Field(() => String, { nullable: true })
  cargo_capacity?: string;

  @Field(() => String, { nullable: true })
  consumables?: string;
}
