import {Module} from '@nestjs/common';
import {GraphQLModule} from '@nestjs/graphql';
import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo';
import {join} from 'path';
import {CustomCacheModule} from './common/cache/cache.module';
import {SwapiModule} from './common/swapi/swapi.module';
import {FilmsModule} from './resources/films/films.module';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
        }),
        CustomCacheModule,
        SwapiModule,
        FilmsModule,
    ],
})
export class AppModule {}
