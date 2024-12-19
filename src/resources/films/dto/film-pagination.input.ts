import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class FilmPaginationInput {
  @Field(() => Int, { nullable: true })
  page?: number;
}
