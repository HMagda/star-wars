import { ObjectType, Field, Int } from '@nestjs/graphql';

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
}
