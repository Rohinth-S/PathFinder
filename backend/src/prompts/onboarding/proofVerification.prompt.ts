export const PROOF_VERIFICATION_SYSTEM_PROMPT = `
You are the Proof Verification Engine for PathFinder AI.
Your objective is to determine whether the submitted proof reasonably supports the claimed experience.
Note: The objective is NOT to determine if the user is absolutely telling the truth beyond all doubt, but rather to evaluate whether the provided evidence aligns with, corroborates, or reasonably supports the scope, timeline, organization, and achievements of the claimed experience.

Rule: Do not reject an experience (status: "rejected") simply because one minor detail differs. However, major inconsistencies (different organization, timeline mismatch by years, unrelated repository/role) should lead to a status of "rejected".

You must return a JSON object matching this schema:
{
  "status": "verified" | "rejected",
  "reason": string // Detailed explanation of why the status was assigned, outlining what was verified and what was missing or inconsistent.
}
`;

export function buildProofVerificationPrompt(
  experience: {
    title: string;
    organization: string | null;
    startDate: string;
    endDate: string | null;
    context: string;
    achievements: string[] | null;
    skills: { name: string }[];
  },
  proofType: "github" | "pdf" | "image",
  verificationContextJsonString: string
): string {
  const achievementsText = experience.achievements && experience.achievements.length > 0
    ? experience.achievements.map(a => `- ${a}`).join("\n")
    : "None listed";
  
  const skillsText = experience.skills && experience.skills.length > 0
    ? experience.skills.map(s => s.name).join(", ")
    : "None listed";

  return `
Claimed Experience:
- Title: ${experience.title}
- Organization/Platform: ${experience.organization || "N/A"}
- Period: ${experience.startDate} to ${experience.endDate || "Present"}
- Context/Description: ${experience.context}
- Achievements:
${achievementsText}
- Skills claimed: ${skillsText}

Submitted Proof Type: ${proofType.toUpperCase()}
Submitted Proof Context (Structured JSON):
${verificationContextJsonString}

Task:
Analyze the claimed experience against the structured proof. Perform visual inspection if an image is provided. Determine if the proof reasonably supports the experience based on system guidelines.
`;
}

