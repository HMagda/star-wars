import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class StarshipFilterInput {
  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  starship_class?: string;

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
  hyperdrive_rating?: string;

  @Field({ nullable: true })
  MGLT?: string;

  @Field({ nullable: true })
  cargo_capacity?: string;

  @Field({ nullable: true })
  consumables?: string;
}
