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
To run the Gemini, Groq connection test script, use:

```bash
npm run test:geminiGroq
```
To run the migrate script, use:

```bash
npm run migrate
```

To upload a seed journey file, use:

```bash
npm run upload-seeds <journey-file.json>
```

Example:

```bash
npm run upload-seeds nikhil-kamath.json
```

To generate embeddings for all Experience nodes, use:

```bash
npm run generate-embeddings
```

Notes:
- The script name in `package.json` is `test:upstash`.
- The Neo4j test script is `test:neo4j`.
- The Gemini, Groq test script is `test:geminiGroq`.
- The migration script is `migrate`.
- The upload seed script is `upload-seeds`.
- The embeddings script is `generate-embeddings`.
- `npm run dev` starts the backend in watch mode from `src/server.ts`.

Neo4j file notes:
- `src/db/constraints.cypher` defines the database constraints needed for unique IDs and lookup fields.
- `src/db/indexes.cypher` defines the indexes used for full-text, vector, and property lookups.
- `src/scripts/migrate.ts` runs the Neo4j constraints and indexes scripts, then verifies the database setup.
- `src/scripts/uploadSeedJourneys.ts` uploads a journey JSON file into Neo4j and creates the graph structure.
- `src/scripts/generateEmbeddings.ts` generates and stores embeddings for all `Experience` nodes.