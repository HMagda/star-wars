import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class WordOccurrence {
  @Field(() => String)
  word!: string;

  @Field(() => Int)
  count!: number;
}

@ObjectType()
export class FilmOpeningStats {
  @Field(() => [WordOccurrence])
  wordOccurrences!: WordOccurrence[];

  @Field(() => [String])
  mostFrequentCharacterNames!: string[];
}
