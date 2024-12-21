import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class Species {
    @Field(() => String)
    id!: string;

    @Field(() => String)
    name!: string;

    @Field(() => String, { nullable: true })
    classification!: string;

    @Field(() => String, { nullable: true })
    designation!: string;

    @Field(() => String, { nullable: true })
    average_height!: string;

    @Field(() => String, { nullable: true })
    average_lifespan!: string;

    @Field(() => String, { nullable: true })
    eye_colors!: string;

    @Field(() => String, { nullable: true })
    hair_colors!: string;

    @Field(() => String, { nullable: true })
    skin_colors!: string;

    @Field(() => String, { nullable: true })
    language!: string;
}
