// INDEXES
// All indexes use IF NOT EXISTS so this file is safe
// to run multiple times without throwing errors.
// Run this after constraints.cypher.
// Indexes build asynchronously — run SHOW INDEXES after
// migration and wait for all statuses to show ONLINE
// before running any queries or seeding data.


// Full Text Indexes
// These power the keyword matching in journeyMatch queries.
// CALL db.index.fulltext.queryNodes uses these indexes.
// Without them every query scans every Experience node.
// Primary search index across all Experience content fields
// Powers the natural language query matching in journeyMatch.
// Searches context, challengeFaced, outcome, emotionText
// simultaneously and returns relevance scores per result.
CREATE FULLTEXT INDEX experience_content_search IF NOT EXISTS
FOR (n:Experience)
ON EACH [n.context, n.challengeFaced, n.outcome];

// Title search index for Experience
// Used when matching on specific role or project names
// e.g. "show journeys involving Google internship"
CREATE FULLTEXT INDEX experience_title_search IF NOT EXISTS
FOR (n:Experience)
ON EACH [n.title, n.organization, n.achievements];

// Goal title and description search
// Used for community browse and goal-level matching
CREATE FULLTEXT INDEX goal_content_search IF NOT EXISTS
FOR (n:Goal)
ON EACH [n.title, n.description];

// Vector Index
// Powers semantic similarity search on Experience nodes.
// Stores the embedding field as a searchable vector.
// This enables finding experiences that are semantically
// similar even when exact keywords do not match.
// Dimension 768 matches Gemini text-embedding-004 output.
// Change dimension if you switch embedding models.


CREATE VECTOR INDEX experience_embedding_index IF NOT EXISTS
FOR (n:Experience)
ON n.embedding
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 384,
    `vector.similarity_function`: 'cosine'
  }
};


// Property Indexes — User

// Index on isFlagged — used in every community query and
// every similarity query to filter out flagged users.
// Without this every query scans all User nodes.
CREATE INDEX user_is_flagged_index IF NOT EXISTS
FOR (u:User)
ON (u.isFlagged);

// Index on reputationScore — used for ordering community
// browse results and similarity results by reputation.
CREATE INDEX user_reputation_score_index IF NOT EXISTS
FOR (u:User)
ON (u.reputationScore);


// Property Indexes — Goal

// Index on topic — used by community browse to count and
// filter goals by top-level topic (Startup, Professionals,
// College Students). Every community screen load uses this.
CREATE INDEX goal_topic_index IF NOT EXISTS
FOR (g:Goal)
ON (g.topic);

// Index on subtopic — used alongside topic index to filter
// to specific subtopic cards in community browse.
CREATE INDEX goal_subtopic_index IF NOT EXISTS
FOR (g:Goal)
ON (g.subtopic);

// Composite index on topic and subtopic together
// Used when filtering by both simultaneously which is the
// most common community browse query pattern.
CREATE INDEX goal_topic_subtopic_composite_index IF NOT EXISTS
FOR (g:Goal)
ON (g.topic, g.subtopic);

// Index on status — used to filter ongoing vs completed goals
CREATE INDEX goal_status_index IF NOT EXISTS
FOR (g:Goal)
ON (g.status);

// Index on startDate — used for chronological ordering
CREATE INDEX goal_start_date_index IF NOT EXISTS
FOR (g:Goal)
ON (g.startDate);


// Property Indexes — Experience


// Index on startDate — used for chronological ordering of
// experiences in profile fetch and timeline rendering
CREATE INDEX experience_start_date_index IF NOT EXISTS
FOR (e:Experience)
ON (e.startDate);

// Index on isVerified — used to filter or highlight
// verified experiences in community browse results
CREATE INDEX experience_is_verified_index IF NOT EXISTS
FOR (e:Experience)
ON (e.isVerified);

// Index on applicationStatus — used when querying for
// experiences that represent application cycles
CREATE INDEX experience_application_status_index IF NOT EXISTS
FOR (e:Experience)
ON (e.applicationStatus);


// Property Indexes — Skill

// Index on type — used to filter skills by Technical/Soft/Domain/ExtraCurricular
CREATE INDEX skill_type_index IF NOT EXISTS
FOR (s:Skill)
ON (s.type);


// Property Indexes — Proof

// Index on status — used to query pending or verified proofs
CREATE INDEX proof_status_index IF NOT EXISTS
FOR (p:Proof)
ON (p.status);

// Index on sourceType — used when filtering by proof type
CREATE INDEX proof_source_type_index IF NOT EXISTS
FOR (p:Proof)
ON (p.sourceType);
