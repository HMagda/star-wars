# Star Wars API (SWAPI) Aggregation Service

This project provides a GraphQL API that aggregates and enriches data from [swapi.tech](https://www.swapi.tech) — a public Star Wars API. It includes endpoints for films, people, species, planets, starships, and vehicles. The service supports caching, filtering, pagination, and provides computed statistics on film opening crawls.

## Features

- **GraphQL API**: A flexible schema to query films, species, planets, starships, vehicles, and associated data.
- **Caching Layer**: Uses Redis for caching 24 hours to reduce load on the upstream SWAPI.
- **Filtering and Pagination**: Supports queries with filters (like `name`, `model`, `search`) and paginating results.
- **Local Filtering**: When SWAPI does not support certain filters, results are fetched and then locally filtered.
- **Full Data or Minimal Data**: Depending on filters, responses are either fetched fully from SWAPI or constructed by fetching minimal data and then supplementing it with individual resource calls if necessary.
- **Film Opening Stats**: Provides statistics on word occurrences in film openings and identifies the most frequently mentioned character(s).

## Technologies

- **Node.js** / **TypeScript**
- **NestJS** as the application framework
- **GraphQL** for querying
- **Redis** for caching
- **Jest** for testing
- **Docker / Docker Compose** for easy local setup

## Project Structure

- `src/`  
  - `app.module.ts` - Root module  
  - `common/` - Shared utilities and services (cache, swapi)  
    - `cache/` - Redis cache integration  
    - `swapi/` - SWAPI integration service  
  - `resources/` - Resource-specific modules, resolvers, and services  
    - `films/`, `people/`, `planets/`, `species/`, `starships/`, `vehicles/`  
      - Each with a `*.service.ts`, `*.resolver.ts`, and `dto/` & `models/` directories
  - `main.ts` - Application entry point

- `tests/` or `__tests__/`  
  - Contains Jest test files for services

## Setup & Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/starwars-api.git
   cd starwars-api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file if necessary. For local development with Docker:
   ```bash
   REDIS_HOST=redis
   REDIS_PORT=6379
   ```

4. **Start with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   This will start the Node.js application and a Redis instance.

   The application will be available at `http://localhost:3000/graphql`.

5. **Running Without Docker**:
   Ensure Redis is running locally, then:
   ```bash
   npm run start:dev
   ```
   
   The GraphQL endpoint is still at `http://localhost:3000/graphql`.

## Usage

- **GraphQL Playground**:  
  Once the server is running, open `http://localhost:3000/graphql` in your browser to access GraphQL Playground and explore the schema.

- **Queries**:
  - `films(filter: FilmFilterInput)`: Retrieve a list of films with optional filters and pagination.  
  - `film(id: String!)`: Retrieve a single film by its ID, including related species, planets, starships, and vehicles.
  - `filmOpeningStats`: Get word occurrence stats and most frequent character names mentioned in film openings.
  - Similar queries exist for `species`, `planets`, `starships`, and `vehicles`.

- **Filtering**:  
  Example filters:
  ```graphql
  query GetAllFilms($search: String) {
    films(filter: { search: $search }) {
      title
      director
    }
  }
  ```

- **Pagination**:  
  Pagination can be done by providing a `page` argument:
  ```graphql
  query {
    films(filter: { page: 2 }) {
      title
    }
  }
  ```

## Testing

- **Run Tests**:
  ```bash
  npm test
  ```
  
  This will run all Jest tests, including coverage reports.

- The test suite covers:
  - `SwapiService` integration and caching behavior.
  - Each resource service (Films, Species, Planets, Starships, Vehicles) with various scenarios (minimal vs. full data, filters, etc.).
  - Special logic like `filmOpeningStats`.

## Architecture & Decisions

- **Caching**:  
  A Redis-based caching mechanism for 24 hours reduces repeated calls to SWAPI.
  
- **Local Filtering**:  
  If SWAPI doesn’t support certain filters, the service fetches full (or minimal) data and applies filters locally.

- **GraphQL Schema**:  
  Chosen over REST for flexibility. Clients can request only the fields they need.

- **Testing**:  
  Jest tests mock SWAPI responses and test filtering logic, resource expansions, and complex operations like opening crawl stats.

