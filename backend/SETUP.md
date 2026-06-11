# Backend Run Guide

From the `backend` folder, run these commands in order:

```bash
npm install
npm run dev
```

To run the Upstash test script, use:

```bash
npm run test:upstash
```
To run the Neo4j connection test script, use:

```bash
npm run test:neo4j
```
To run the migrate script, use:

```bash
npm run migrate
```

Notes:
- The script name in `package.json` is `test:upstash`.
- The Neo4j test script is `test:neo4j`.
- The migration script is `migrate`.
- `npm run dev` starts the backend in watch mode from `src/server.ts`.

Neo4j file notes:
- `src/config/neo4j.config.ts` sets up and exports the shared Neo4j driver and connection helpers.
- `src/db/constraints.cypher` defines the database constraints needed for unique IDs and lookup fields.
- `src/db/indexes.cypher` defines the indexes used for full-text, vector, and property lookups.
- `src/scripts/migrate.ts` runs the Neo4j constraints and indexes scripts, then verifies the database setup.
- `src/scripts/testNeo4j.ts` checks that the Neo4j connection works and runs a simple query.
