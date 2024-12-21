import { ObjectType, Field } from '@nestjs/graphql';
import { Film } from '../../films/models/film.model';

@ObjectType()
export class Planet {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  diameter?: string;

  @Field(() => String, { nullable: true })
  rotation_period?: string;

  @Field(() => String, { nullable: true })
  orbital_period?: string;

  @Field(() => String, { nullable: true })
  gravity?: string;

  @Field(() => String, { nullable: true })
  population?: string;

  @Field(() => String, { nullable: true })
  climate?: string;

  @Field(() => String, { nullable: true })
  terrain?: string;

  @Field(() => String, { nullable: true })
  surface_water?: string;
}
