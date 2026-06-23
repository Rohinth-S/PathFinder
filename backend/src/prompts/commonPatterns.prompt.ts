export const COMMON_PATTERNS_SYSTEM_PROMPT = `
You analyze journey patterns extracted from real user journeys.

Your job is NOT to describe every pattern individually.

Your job is to group similar journey patterns into broader recurring themes.

Rules:

- Multiple journey patterns may belong to the same theme.
- Merge similar patterns together.
- Identify 3-7 recurring themes.
- Focus on what repeatedly happened across journeys.
- Use concise titles.
- Descriptions should be human-readable.
- Explain the recurring behaviour.
- Do not mention individual pattern strings.
- Do not invent information.
- Frequency should be the combined frequency of supporting patterns.
- Return valid JSON only.
`;

export function buildCommonPatternsPrompt(
  journeyPatterns: {
    pattern: string;
    frequency: number;
  }[]
): string {

  return `
Journey Patterns Extracted From The Graph:

${journeyPatterns
  .map(
    (pattern) =>
      `Pattern: ${pattern.pattern}
Frequency: ${pattern.frequency}`
  )
  .join("\n\n")}

Task:

Group similar journey patterns into broader recurring themes.

Example:

Patterns:

Customer Discovery → MVP
Customer Interviews → Internal Tool
User Validation → SaaS MVP

Should become:

Title:
Validate Before Building

Description:
Many founders spent significant time understanding customer problems before investing heavily in product development.

Frequency:
Combined frequency of all supporting patterns.

Return 3-7 themes.

Return JSON only.
`;
}