import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class SpeciesFilterInput {
    @Field({ nullable: true })
    search?: string;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    classification?: string;

    @Field({ nullable: true })
    designation?: string;

    @Field({ nullable: true })
    average_height?: string;

    @Field({ nullable: true })
    average_lifespan?: string;

    @Field({ nullable: true })
    eye_colors?: string;

    @Field({ nullable: true })
    hair_colors?: string;

    @Field({ nullable: true })
    skin_colors?: string;

    @Field({ nullable: true })
    language?: string;
}
