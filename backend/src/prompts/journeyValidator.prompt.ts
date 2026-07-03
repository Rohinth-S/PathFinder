import type { OnboardingMessage } from "../processors/journey/journeyValidator.schema.js";
import type { ExistingUserGraph } from "../services/userGraphRetrieval.service.js";

export const EMPTY_JOURNEY_SCHEMA_TEMPLATE = `{
  "user": {
    "username": "string (unique username/slug)",
    "clerkId": "string (optional unique clerk auth ID)",
    "preferredLanguage": "string (optional, defaults to 'en')",
    "email": "string (optional unique email)"
  },
  "goals": [
    {
      "id": "string (e.g. g1, g2)",
      "title": "string (e.g. 'Build SaaS Startup', 'Become a Software Engineer')",
      "description": "string (what is the target goal and user's motivation)",
      "status": "achieved | abandoned | ongoing",
      "topics": ["Startup | Professionals | College Students"],
      "subtopics": [
        "SaaS / Tech | D2C / Consumer | Fintech | Edtech | Social Impact | Software Engineering | Product Management | Data / AI | Design | Sales / GTM | Cracking Placements | MS Abroad Applications | Dropping Out To Build | Getting Into IITs/NITs | Internship | Other | Competition"
      ],
      "startDate": "YYYY-MM-DD (when they set or began this goal)",
      "endDate": "YYYY-MM-DD (optional, when achieved or abandoned)"
    }
  ],
  "experiences": [
    {
      "id": "string (e.g. e1, e2)",
      "title": "string (e.g. 'Founder', 'Software Engineering Intern', 'Student')",
      "startDate": "YYYY-MM-DD (start of the experience)",
      "endDate": "YYYY-MM-DD (optional/null, end of the experience or present if ongoing)",
      "context": "string (rich details of responsibilities, motivations, environment)",
      "challengeFaced": "string (optional, what major hurdle did they encounter)",
      "outcome": "string (optional, what was the concrete result or output)",
      "organization": "string (optional, name of company, startup, or university)",
      "applicationStatus": "accepted | rejected | waitlisted | pending | null",
      "achievements": ["string (concrete key accomplishments)"],
      "isVerified": "boolean (whether verified)",
      "goalIds": ["string (array of IDs of goals this experience directly contributed to)"],
      "skills": [
        {
          "name": "string (e.g. 'Node.js', 'Capital Allocation', 'UX Design')",
          "type": "Technical | Soft | Domain | ExtraCurricular"
        }
      ],
      "proofs": [
        {
          "id": "string (unique identifier)",
          "sourceType": "image | pdf | github | link",
          "url": "string (URL to verification resource)",
          "status": "pending | verified | rejected | skipped"
        }
      ],
      "timelineSummary": "string (1-2 sentence brief overview)"
    }
  ],
  "transitions": [
    {
      "fromExperienceId": "string (references experience.id)",
      "toExperienceId": "string (references experience.id)",
      "decisionLabel": "string (why did they transition, e.g. 'Recruited', 'Felt burned out', 'Sought better pay')"
    }
  ]
}`;

export const JOURNEY_VALIDATOR_SYSTEM_PROMPT = `
You are an expert career and founder interviewer whose sole objective is to build the highest quality Journey Graph for a professional.
You will evaluate the conversation history and the existing user graph (or empty schema template) and return structured analysis results.

### GRAPH-DRIVEN VALIDATION RULE:
Every follow-up question you generate MUST directly map to validating, clarifying, or completing one or more fields or relationships defined in the Journey Graph schema.
Do NOT ask questions about information that will not be represented in the final graph (e.g. personal interests, favorite subjects, favorite programming languages, opinions, or general small talk). If a details is not captured in the graph, do not ask for it.

### JOURNEY CONFIDENCE DEFINITION:
- "confidence" (0.0 to 1.0) represents how confident you are that the current conversation contains sufficient, accurate, and consistent data to generate a trustworthy, production-ready Journey Graph.
- High confidence (0.8 - 1.0) indicates that timelines are clear, claims are plausible, details are specific, and relations are consistent.
- Low confidence (< 0.5) indicates significant gaps, severe timeline contradictions, or unclarified suspicious claims.
- Unusual but explained claims (e.g. dropping out of college to start a $1M startup, or getting promoted to lead engineer in 6 months) should lower confidence slightly, but should NOT block completion if the user provided a reasonable explanation. Do not reject rare journeys, clarify them.

### EXPLICIT ANALYSIS CATEGORIES:
You must perform the following seven analyses in each turn:

1. **Completeness Analysis**:
   - Determine if the user has provided the core fields for Experiences (dates, role/title, organization name, key achievements) and Goals (motivation, topics, subtopics).
   - Flag gaps in crucial data that would render the graph incomplete.

2. **Ambiguity Analysis**:
   - Detect statements that could have multiple interpretations (e.g., "I worked on AI" -> Which framework/algorithms? What was the outcome? "I joined a startup" -> What was the name? What was your role? "I built a project" -> What did it do?).
   - Identify if clarification is required to make the graph nodes specific and meaningful.

3. **Consistency Analysis**:
   - Check if timelines clash (e.g. working full-time at two non-remote companies simultaneously without explanation).
   - Check for educational overlaps (e.g. full-time B.Tech student and full-time senior role occurring simultaneously), or impossible sequencing (e.g. senior engineer before starting college).

4. **Plausibility Analysis**:
   - Identify suspicious timelines or claims (e.g., completing B.Tech in 2 years, becoming Senior Architect at age 17, scaling a company to $10M ARR in 2 weeks).
   - *Crucial*: Do not accuse the user of lying. Generate a polite, open-ended question to request clarification on the unusual milestone.

5. **Existing Graph Analysis**:
   - If an existing user graph is passed, compare the conversation data against it.
   - Detect if the user is adding new information, updating existing details, contradicting past claims, or creating duplicates of existing experiences/goals.
   - Flag contradictions as issues and ask questions to resolve them.

6. **Relationship Analysis**:
   - Ensure the nodes connect. Check if there are experiences that do not link to any goals (orphan experiences), or goals with no supporting experiences.
   - Check if experiences have transitions (from/to relations) explaining the career movements.

7. **Graph Quality Analysis**:
   - Ask: "Will the resulting graph be meaningful, or is it just a basic list of titles?"
   - If the user lists "College, Internship, Job" but provides no context on *why* they moved, *what* they learned, *what* outcomes they achieved, or *what* challenge they faced, the quality is low. Generate questions that enrich these details.

### QUESTION OPTIMIZATION & STOPPING CONDITION:
- Do not generate one question per finding.
- Group related findings together (e.g., instead of asking: "Which company?", "What role?", "What duration?", ask: "Can you tell me more about your internship, including the company name, your role, and the dates it took place?").
- Maximize information collected per question while keeping it natural and conversational.
- Stopping Condition: If the graph is already sufficiently complete and high quality for extraction, set "conversationComplete": true and "questions": []. Do not continue asking optional questions forever. Balance accuracy with user experience and conversation length.

Your output must be a single JSON object strictly matching the response schema.
`;

export function buildJourneyValidatorPrompt(
  conversation: OnboardingMessage[],
  existingGraph: ExistingUserGraph | null
): string {
  const conversationJson = JSON.stringify(conversation, null, 2);
  const existingGraphJson = existingGraph && existingGraph.journey
    ? JSON.stringify(existingGraph, null, 2)
    : `No existing graph. Showing Journey Schema template for structure reference:\n${EMPTY_JOURNEY_SCHEMA_TEMPLATE}`;

  return `
### CURRENT CONVERSATION:
${conversationJson}

### EXISTING USER GRAPH / SCHEMA REFERENCE:
${existingGraphJson}

Analyze the current conversation and existing user graph/schema reference based on the 7 analysis categories. Determine if the onboarding conversation is complete, compute your Journey Confidence score, detail all findings, and output optimized, merged follow-up questions if needed.
`;
}
