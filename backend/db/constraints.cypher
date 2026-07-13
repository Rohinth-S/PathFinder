
// CONSTRAINTS
// All constraints use IF NOT EXISTS so this file is safe
// to run multiple times without throwing errors.
// Run this before indexes.cypher and before any data is written.


// User Constraints

CREATE CONSTRAINT user_username_unique IF NOT EXISTS
FOR (u:User)
REQUIRE u.username IS UNIQUE;

// Every User must have a unique Clerk authentication id
// This is the lookup key used by the auth processor
// Without this, two users could share a clerkId and auth
// lookups would return multiple results
CREATE CONSTRAINT user_clerk_id_unique IF NOT EXISTS
FOR (u:User)
REQUIRE u.clerkId IS UNIQUE;

// Goal Constraints

// Every Goal must have a unique internal id
CREATE CONSTRAINT goal_id_unique IF NOT EXISTS
FOR (g:Goal)
REQUIRE g.id IS UNIQUE;


// Experience Constraints

// Every Experience must have a unique internal id
CREATE CONSTRAINT experience_id_unique IF NOT EXISTS
FOR (e:Experience)
REQUIRE e.id IS UNIQUE;


// Skill Constraints


// Skill names must be globally unique
// Skills are shared across all users — duplicate skill nodes
// must never be created. This constraint enforces that at the
// database level so MERGE on Skill.name is always safe.
CREATE CONSTRAINT skill_name_unique IF NOT EXISTS
FOR (s:Skill)
REQUIRE s.name IS UNIQUE;

// Proof Constraints

// Every Proof must have a unique internal id
CREATE CONSTRAINT proof_id_unique IF NOT EXISTS
FOR (p:Proof)
REQUIRE p.id IS UNIQUE;
