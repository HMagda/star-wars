import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Species } from '../../species/models/species.model';
import { Planet } from '../../planets/models/planet.model';
import { Starship } from '../../starships/models/starship.model';
import { Vehicle } from '../../vehicles/models/vehicle.model';

@ObjectType()
export class Film {
  @Field(() => String)
  title!: string;

  @Field(() => Int)
  episode_id!: number;

  @Field(() => String)
  opening_crawl!: string;

  @Field(() => String)
  director!: string;

  @Field(() => String)
  producer!: string;

  @Field(() => String)
  release_date!: string;

  @Field(() => [Species], { nullable: true })
  species?: Species[];

  @Field(() => [Planet], { nullable: true })
  planets?: Planet[];

  @Field(() => [Starship], { nullable: true })
  starships?: Starship[];

  @Field(() => [Vehicle], { nullable: true })
  vehicles?: Vehicle[];
}
