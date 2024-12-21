import { Resolver, Query, Args } from "@nestjs/graphql";
import { SpeciesService } from "./species.service";
import { Field, ObjectType, Int, InputType } from "@nestjs/graphql";
import { Species } from "./models/species.model";
import { SpeciesFilterInput } from "./dto/species-filter.input";
import { PaginationInput } from "../common/dto/pagination.input";

@Resolver(() => Species)
export class SpeciesResolver {
    constructor(private readonly speciesService: SpeciesService) {}

    @Query(() => [Species], { name: "species" })
    async getAllSpecies(
        @Args("filter", { nullable: true }) filter?: SpeciesFilterInput,
        @Args("pagination", { nullable: true }) pagination?: PaginationInput,
    ) {
        return this.speciesService.getAllSpecies(filter, pagination);
    }

    @Query(() => Species, { name: "speciesById" })
    async getSpeciesById(@Args("id") id: string) {
        return this.speciesService.getSpeciesById(id);
    }
}
