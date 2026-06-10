# Neo4j Architecture Rules

## Purpose

Neo4j is the source of truth for all user journeys.

Redis is a cache layer only.

AI outputs must map into this graph structure.

Do not introduce new node types, relationship types, properties, or relationship directions without explicit schema approval.

---

## Design Principles

### Experience Is The Core Node

All journey data revolves around Experience nodes.

The following features are derived from Experiences:

* Goals
* Skills
* Proof Verification
* Journey Matching
* AI Summaries
* Similarity Detection
* Community Discovery

An Experience represents one meaningful:

* Project
* Internship
* Job
* Education Phase
* Application Cycle
* Startup Attempt
* Career Transition
* Personal Milestone

Do not combine multiple unrelated phases into a single Experience.

---

### Relationships Carry Meaning

Information describing a connection belongs on relationships.

Examples:

* decisionLabel
* gapMonths
* gapReason
* order

Do not duplicate relationship data onto nodes.

---

### Graph Ownership Rules

* Every Goal belongs to exactly one User.
* Every Experience belongs to exactly one User.
* Every Proof belongs to exactly one Experience.
* Skills are global and shared across users.

---

### AI Rules

AI may:

* Extract
* Classify
* Validate
* Summarise

AI may not:

* Create new node types
* Create new relationship types
* Modify graph architecture
* Change property names
* Change relationship directions

---

### Schema Freeze Rule

The following are considered frozen:

* Node Types
* Relationship Types
* Property Names
* Relationship Directions

---

# Graph Schema

## User

Represents a platform member.

### Properties

| Property          | Type     | Description                                                   |
| ----------------- | -------- | ------------------------------------------------------------- |
| id                | UUID     | Internal unique identifier.                                   |
| clerkId           | String   | Clerk authentication identifier.                              |
| preferredLanguage | String?   | Preferred language for AI responses and translations.         |
| reputationScore   | Integer  | Community reputation score.                                   |
| flagCount         | Integer  | Number of accepted flags received.                            |
| isFlagged         | Boolean  | Indicates whether the user is hidden from discovery features. |
| journeySummary    | String?   | AI-generated summary of the user's journey.                   |
| createdAt         | DateTime | Timestamp when the user was created.                          |

---

## Goal

Represents an objective pursued by a user.

### Properties

| Property    | Type   | Description                                |
| ----------- | ------ | ------------------------------------------ |
| id          | UUID   | Unique goal identifier.                    |
| title       | String | Short title of the goal.                   |
| description | String | Detailed description of the objective.     |
| status      | String | Current state of the goal.                 |
| topic       | String | Top-level community category.              |
| subtopic    | String | Specific category within a topic.          |
| startDate   | Date   | Date when the goal started.                |
| endDate     | Date   | Date when the goal ended or was completed. |

### Allowed Topic Values

* Startup
* Professionals
* College Students

### Startup Subtopics

* SaaS / Tech
* D2C / Consumer
* Fintech
* Edtech
* Social Impact

### Professionals Subtopics

* Software Engineering
* Product Management
* Data / AI
* Design
* Sales / GTM

### College Students Subtopics

* Cracking Placements
* MS Abroad Applications
* Dropping Out To Build
* Getting Into IITs/NITs
* First Internship

### Allowed Status Values

* active
* achieved
* abandoned
* ongoing

---

## Experience

Represents a single meaningful phase, project, role, internship, startup attempt, education period, application cycle, or life event.

### Properties

| Property          | Type     | Description                                                                             |
| ----------------- | -------- | --------------------------------------------------------------------------------------- |
| id                | UUID     | Unique experience identifier.                                                           |
| title             | String   | Short title describing the experience.                                                  |
| type              | String   | Free-form category assigned by user or AI. No restrictions.                             |
| startDate         | Date     | Date when the experience started.                                                       |
| endDate           | Date?     | Date when the experience ended. Null if ongoing.                                        |
| context           | String   | Background information and circumstances surrounding the experience.                    |
| challengeFaced    | String?   | Main difficulties encountered during the experience.                                    |
| outcome           | String?  | Result or outcome of the experience.                                                    |
| emotionText       | String?   | Optional emotional reflections associated with the experience.                          |
| organization      | String?   | Company, institution, university, startup, or organization involved.                    |
| applicationStatus | String?  | Status of an application if the experience represents an application process.           |
| achievements      | String[]? | Significant achievements, milestones, awards, or accomplishments during the experience. |
| isVerified        | Boolean  | Indicates whether proof verification succeeded.                                         |
| embedding         | Float[]?  | Vector embedding used for similarity matching and future vector search.                 |

### Allowed Application Status Values

* accepted
* rejected
* waitlisted
* pending

### Achievement Examples

* Won Smart India Hackathon
* Published Research Paper
* Raised Funding
* Reached 10,000 Users
* Secured Google Internship
* AIR 500 In GATE
* IIT Admission

---

## Skill

Represents a skill gained or demonstrated through one or more experiences.

### Properties

| Property | Type   | Description              |
| -------- | ------ | ------------------------ |
| id       | UUID   | Unique skill identifier. |
| name     | String | Canonical skill name.    |
| type     | String | Skill classification.    |

### Allowed Type Values

* Technical
* Soft
* Domain
* ExtraCurricural

### Skill Rules

* Skills are global.
* Skills may be connected to multiple Experiences.
* Duplicate Skill nodes must never be created.

### Examples

* React
* Node.js
* Product Management
* Fundraising
* Machine Learning
* Public Speaking
* Debate
* Football
* Photography
* Event Management
---

## Proof

Represents evidence supporting an experience claim.

### Properties

| Property   | Type     | Description                                               |
| ---------- | -------- | --------------------------------------------------------- |
| id         | UUID     | Unique proof identifier.                                  |
| sourceType | String   | Original Source before upload.                                 |
| url        | String   | Cloudinary URL, GitHub URL, or external link.             |
| status     | String   | Current verification status.                              |
| verifiedAt | DateTime? | Timestamp of successful verification.                     |
| reason     | String?   | Explanation when proof verification fails or is rejected. |

### Allowed SourceType Values

* image
* pdf
* github
* link

### Allowed Status Values

* pending
* verified
* rejected
* skipped

---

# Relationship Types

## HAS_GOAL

Relationship:

(User)-[:HAS_GOAL]->(Goal)

Purpose:

Connects a User to a Goal they own.

Relationship Properties:

None.

---

## HAS_EXPERIENCE

Relationship:

(User)-[:HAS_EXPERIENCE]->(Experience)

Purpose:

Connects a User to an Experience they own.

Relationship Properties:

| Property | Type | Description |
|-----------|--------|-------------|
| order | Integer | Timeline ordering value used for chronological sorting. |

---

## CONTRIBUTED_TO

Relationship:

(Experience)-[:CONTRIBUTED_TO]->(Goal)

Purpose:

Indicates that an Experience contributed toward pursuing or achieving a Goal.

Relationship Properties:

None.

---

## BUILT_SKILL

Relationship:

(Experience)-[:BUILT_SKILL]->(Skill)

Purpose:

Indicates that a Skill was gained, improved, or demonstrated through an Experience.

Relationship Properties:

None.

---

## TRANSITION

Relationship:

(Experience)-[:TRANSITION]->(Experience)

Purpose:

Represents movement from one Experience to another.

Relationship Properties:

| Property | Type | Description |
|-----------|--------|-------------|
| decisionLabel | String | Key decision that caused the transition. |
| gapMonths | Integer | Number of months between experiences. |
| gapReason | String? | Explanation for the gap if one existed. |

Example:

College

↓ TRANSITION

decisionLabel = "Rejected Placement Offer"

gapMonths = 4

↓

Startup

---

## HAS_PROOF

Relationship:

(Experience)-[:HAS_PROOF]->(Proof)

Purpose:

Connects an Experience to supporting evidence.

Relationship Properties:

None.

---

# Canonical Graph Structure

User

├── HAS_GOAL ─────────► Goal

└── HAS_EXPERIENCE ───► Experience
                         │
                         ├── CONTRIBUTED_TO ─► Goal
                         │
                         ├── BUILT_SKILL ────► Skill
                         │
                         ├── HAS_PROOF ──────► Proof
                         │
                         └── TRANSITION ─────► Experience

---

# Relationship Direction Rules

- HAS_GOAL must always point User → Goal.
- HAS_EXPERIENCE must always point User → Experience.
- CONTRIBUTED_TO must always point Experience → Goal.
- BUILT_SKILL must always point Experience → Skill.
- HAS_PROOF must always point Experience → Proof.
- TRANSITION must always point Experience → Experience.
- Relationship directions are fixed and must never be reversed.

# Graph Constraints

| Constraint           |
| -------------------- |
| User.id UNIQUE       |
| User.clerkId UNIQUE  |
| Goal.id UNIQUE       |
| Experience.id UNIQUE |
| Skill.id UNIQUE      |
| Proof.id UNIQUE      |

---

# Mandatory Rules

* Every Goal belongs to exactly one User.
* Every Experience belongs to exactly one User.
* Every Proof belongs to exactly one Experience.
* Skill nodes are shared globally.
* Duplicate Skill nodes are not allowed.
* TRANSITION connects Experience → Experience only.
* BUILT_SKILL connects Experience → Skill only.
* HAS_PROOF connects Experience → Proof only.
* CONTRIBUTED_TO connects Experience → Goal only.
* Relationship directions are fixed.
* Node labels are fixed.
* Property names are fixed.

---

# Features Mapped To Graph

| Feature             | Graph Components                     |
| ------------------- | ------------------------------------ |
| Onboarding          | User, Goal, Experience, Skill, Proof |
| Journey Querying    | Goal, Experience, Skill, TRANSITION  |
| Community Browsing  | Goal.topic, Goal.subtopic            |
| Similarity Matching | Experience, Skill, embedding         |
| Reputation          | User.reputationScore                 |
| Flagging            | User.flagCount, User.isFlagged       |
| Proof Verification  | Proof, HAS_PROOF                     |
| AI Summaries        | User.journeySummary                  |
| Semantic Search     | Experience.embedding                 |

```
```
