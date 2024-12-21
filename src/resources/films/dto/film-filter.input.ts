import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class FilmFilterInput {
  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  title?: string;

  @Field(() => Int, { nullable: true })
  episode_id?: number;

  @Field({ nullable: true })
  opening_crawl?: string;

  @Field({ nullable: true })
  director?: string;

  @Field({ nullable: true })
  producer?: string;

}
