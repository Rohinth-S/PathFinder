# Neo4j Seed Store Architecture

## Purpose
This document defines the canonical architecture for the following system components, modules, and storage systems:
* createGraph.processor.ts
* generateEmbeddings.processor.ts
* generateEmbeddings.ts
* Neo4j graph storage
* Embedding storage

---

## System Overview
Journey ingestion flow sequence:

JourneyJson
      ↓
createGraph.processor.ts
      ↓
Neo4j Graph
      ↓
generateEmbeddings.ts
      ↓
Experience Embeddings
      ↓
Neo4j Vector Storage

Graph creation and embedding generation are strictly isolated separate responsibilities.

---

## createGraph.processor.ts

### Responsibility
Convert validated JourneyJson structured records into Neo4j graph data nodes and relationships.

Input Signature:
JourneyJson

Output Signature:
Promise<void>

The processor must never receive or parse raw markdown blocks directly.

### Processing Order
Step 1: Validate input data structure against schema definitions.
Execution command: journeyJsonSchema.safeParse()
This validation check must succeed before continuing.

Step 2: Initialize and begin an isolated Neo4j database transaction context.

Step 3: Upsert the User root record entity.

Step 4: Upsert Goal entities and establish relationship structures.
Create graph edge structure:
(User)-[:HAS_GOAL]->(Goal)

Step 5: Upsert Experience entities, establish relationships, and map sequencing metrics.
Create graph edge structure:
(User)-[:HAS_EXPERIENCE]->(Experience)
Store sequence metadata property field:
order
This property must be stored directly on the established relationship edge.

Step 6: Map associations and connect Experience entities directly to Goal entities.
Create graph edge structure:
(Experience)-[:CONTRIBUTED_TO]->(Goal)

Step 7: Instantiate associated Skill data structures.
Create graph edge structure:
(Experience)-[:BUILT_SKILL]->(Skill)

Step 8: Instantiate supporting Proof or credential records.
Create graph edge structure:
(Experience)-[:HAS_PROOF]->(Proof)

Step 9: Model sequencing paths by instantiating state transitions between consecutive Experiences.
Create graph edge structure:
(Experience)-[:TRANSITION]->(Experience)

Step 10: Finalize, execute, and commit the active database transaction.

---

## Transaction Rules
All combined operational graph writes must strictly execute inside one single unified database transaction block.

Execution Lifecycle Flow:
Begin
 ↓
User
 ↓
Goals
 ↓
Experiences
 ↓
Skills
 ↓
Proofs
 ↓
Transitions
 ↓
Commit

On Transaction Failure Exception Handling:
Rollback
Throw Error

Partial graph writes or uncommitted transient states are strictly prohibited from persisting.

---

## Idempotency Rules
Graph execution engines must be safe and stable to run repeatedly over identical data pools.

Always utilize explicit merge statements:
MERGE

Never implement naive creation statement declarations:
CREATE

Executing ingestion updates over identical journey data sets must never result in duplicate nodes or duplicate relationships.

---

## Embedding Architecture
Vector embeddings are computed and stored only after the primary graph validation and creation workflow succeeds completely.
* Embedding generation is NOT a sub-component of the createGraph pipeline.
* Embedding generation acts as an isolated, asynchronous decoupled script or automated job pipeline.

---

## Embedding Model Specification
Target Embedding Model:
BAAI/bge-small-en-v1.5

Runtime Interface Client Library:
@xenova/transformers

Pooling Optimization Configuration Strategy:
mean

Tensor Vector Normalization Flag:
true

---

## What Gets Embedded
Target node vector processing is isolated exclusively to:
Experience

Do not generate vectors or store embedding indices for any of the following node labels:
* User
* Goal
* Skill
* Proof

Reasoning: Experience entity nodes aggregate the densest block of semantic information and operate as the core discrete retrieval unit during semantic index lookups.

---

## Experience Embedding Text Schema
Source string representations are dynamically built by parsing data from these specific entity fields:
* title
* context
* challengeFaced
* outcome
* achievements
* skills

Canonical Source Format Serialization Template:
Title: ...

Context: ...

Challenge: ...

Outcome: ...

Achievements: ...

Skills: ...

Missing, undefined, or empty attribute values are entirely omitted from string generation without injecting filler text.

---

## Storage Rules
Persist fields explicitly as attributes on target node configurations:
* e.embedding
* e.embeddingText

Cypher Mapping Pattern Implementation Example:
SET e.embedding = $embedding
SET e.embeddingText = $embeddingText

---

## generateEmbeddings.processor.ts

### Responsibility
Process vector execution cycles for a single standalone Experience node entity.

Input Signature:
ExperienceEmbeddingInput

Internal Processing Routine Workflow Block:
Build Embedding Text
      ↓
Generate Embedding
      ↓
Store In Neo4j

Output Signature:
Promise<void>

---

## generateEmbeddings.ts

### Responsibility
Execute batch orchestration and iteration routines across unindexed or modified Experience entity collections.

Execution Pipeline Sequence:
Load Model
      ↓
Fetch Experiences
      ↓
Generate Embeddings
      ↓
Store Embeddings

Input Dataset Object Types:
Experience Nodes

Output Result Object Types:
Experience Embeddings

---

## Re-Execution Rules
Vector processing scripts can be run over pre-existing databases multiple times without error.
This routine is safe and deterministic.
Pre-existing stored vector values matching modified inputs are directly overwritten.

Execution comparison:
Old embedding
      ↓
New embedding

No duplicated vector indices or duplicate node identities are created during execution loops.