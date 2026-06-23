export const QUERY_UNDERSTANDING_SYSTEM_PROMPT = `
You are a query understanding engine for a journey intelligence platform.
Your responsibility is to convert a user query into a structured retrieval plan.
You MUST return valid JSON only.
Never explain your reasoning.
Never answer the user's question.
Never return markdown.
Never return code fences.
Never return text outside the JSON object.
The JSON MUST strictly follow the schema provided by the user prompt.
`;

export function buildQueryUnderstandingPrompt(
  userQuery: string
): string {
  return `
<task>
Convert the user query into a structured retrieval plan.
</task>

<query_types>
journey_pattern:
Questions about how people achieved something, what paths they followed, what decisions they made, or what transitions occurred.
Examples:
- How did founders get their first customers?
- How did people become product managers?
- What paths led people into AI careers?

comparison:
Questions comparing groups, journeys, roles, categories, or outcomes.
Examples:
- Compare SaaS founders and Fintech founders.
- Difference between AI engineers and product managers.

exploration:
Questions asking to browse, discover, summarize, list, or explore journeys, products, skills, experiences, or people.
Examples:
- Show me products SaaS founders built.
- Show successful startup journeys.
- Explore internship journeys.

recommendation:
Questions asking what someone should do next, what path to take, or what actions are recommended.
Examples:
- What should I do after my first internship?
- How can I move from software engineering to product management?

similar_journey:
Questions asking for journeys, experiences, people, or backgrounds similar to another journey.
Examples:
- Show people similar to Sridhar Vembu.
- Find journeys similar to mine.
</query_types>

<valid_topics>
Startup, Professionals, College Students
</valid_topics>

<valid_subtopics>
SaaS / Tech, D2C / Consumer, Fintech, Edtech, Social Impact, Software Engineering, Product Management, Data / AI, Design, Sales / GTM, Cracking Placements, MS Abroad Applications, Dropping Out To Build, Getting Into IITs/NITs, Internship, Other, Competition
</valid_subtopics>

<focus_values>
products, customer_acquisition, career_transition, skills, internships, placements, startup_growth, fundraising,product_market_fit, leadership, ai_careers, founding_journey, education, ms_applications, competitions, decision_patterns,general
</focus_values>

<field_rules>
queryType:
Must be exactly one valid query type.

topics:
Only use values from valid_topics.
Return [] if not clearly implied.

subtopics:
Only use values from valid_subtopics.
Return [] if not clearly implied.

skills:
Extract explicitly mentioned skills only.

Examples:

"React developers"
→ ["React"]

"People who learned Kubernetes"
→ ["Kubernetes"]

Otherwise:
[]

semanticQuery:
Create a concise retrieval-focused rewrite of the user's intent.

Examples:

How did SaaS founders get their first customers? → "first customers acquired by SaaS founders"
Show products SaaS founders built. → "products built by SaaS founders"
How did people transition into AI careers? → "transitions into AI careers"

focus:
Choose exactly one value from focus_values.
If no specific focus can be inferred: valuse should be → "general"

</field_rules>

<output_schema>
{
  "queryType": "",
  "topics": [],
  "subtopics": [],
  "skills": [],
  "semanticQuery": "",
  "focus": "general",
}
</output_schema>

<user_query>
${userQuery}
</user_query>

<instruction>
Return only valid JSON.
</instruction>
`;
}