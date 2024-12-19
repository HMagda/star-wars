import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class FilmFilterInput {
  @Field({ nullable: true })
  search?: string;
  
  @Field(() => Int, { nullable: true })
  page?: number;
}
