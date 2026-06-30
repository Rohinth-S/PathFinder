import { geminiProvider } from "../../ai/gemini.provider.js";
import { JOURNEY_EXTRACTION_SYSTEM_PROMPT, buildJourneyExtractionPrompt } from "../../prompts/journeyExtraction.prompt.js";
import { journeyExtractionSchema } from "./journeyExtraction.jsonSchema.js";
import type { JourneyJson, JourneyUser, JourneyGoal, JourneyExperience, JourneyTransition, JourneyProof } from "./types.js";

const ADJECTIVES = ["star", "indie", "audience", "clark", "bright", "stealth", "solo", "pixel", "code", "tech", "growth", "scale", "venture"];
const NOUNS = ["builder", "operator", "founder", "engineer", "creator", "maker", "hacker", "designer", "pioneer", "architect"];

function cleanUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateRandomUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}-${noun}-${num}`;
}

function getUserPrefix(username: string): string {
  const cleaned = cleanUsername(username);
  const parts = cleaned.split("-");

  const letters = parts
    .filter((p) => !/^\d+$/.test(p))
    .map((p) => p[0])
    .join("");

  const numbers = parts.filter((p) => /^\d+$/.test(p)).join("");

  const suffix = numbers ? `-${numbers}` : "-99";
  return `${letters}${suffix}`;
}

function generateSlug(title: string): string {
  const cleaned = title.replace(/[^a-zA-Z0-9\s-]/g, "");
  const words = cleaned.split(/[\s-]+/);
  const stopWords = new Set([
    "and", "or", "a", "an", "the", "of", "to", "for", "in", "on", "at",
    "with", "by", "from", "through", "as", "is", "was", "are", "were"
  ]);

  const initials = words
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0 && !stopWords.has(w))
    .map((w) => w[0]);

  return initials.join("").slice(0, 10);
}

function normalizeDate(d: string | null | undefined): string | null {
  if (!d) return null;
  const trimmed = d.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (lower === "null" || lower === "ongoing" || lower === "present") {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }
  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01-01`;
  }

  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  } catch {
    // ignore
  }

  return trimmed;
}

export async function extractJourney(
  journeyText: string,
  userContext?: Partial<JourneyUser>
): Promise<JourneyJson> {
  const rawResult = await geminiProvider.generateStructuredJson<any>({
    systemPrompt: JOURNEY_EXTRACTION_SYSTEM_PROMPT,
    userPrompt: buildJourneyExtractionPrompt(journeyText),
    schema: journeyExtractionSchema,
  });

  // 1. Resolve and format the user details
  const finalUsername =
    userContext?.username ||
    rawResult.user?.username ||
    generateRandomUsername();

  const user: JourneyUser = {
    username: cleanUsername(finalUsername),
    clerkId: userContext?.clerkId ?? rawResult.user?.clerkId ?? null,
    preferredLanguage: userContext?.preferredLanguage ?? rawResult.user?.preferredLanguage ?? "en",
    reputationScore: userContext?.reputationScore ?? rawResult.user?.reputationScore ?? 0,
    flagCount: userContext?.flagCount ?? rawResult.user?.flagCount ?? 0,
    isFlagged: userContext?.isFlagged ?? rawResult.user?.isFlagged ?? false,
    email: userContext?.email ?? rawResult.user?.email ?? null,
  };

  const userPrefix = getUserPrefix(user.username);

  // Maps to trace updated IDs
  const goalIdMap = new Map<string, string>();
  const experienceIdMap = new Map<string, string>();
  const usedIds = new Set<string>();

  function getUniqueId(baseId: string): string {
    let uniqueId = baseId;
    let counter = 1;
    while (usedIds.has(uniqueId)) {
      counter++;
      uniqueId = `${baseId}-${counter}`;
    }
    usedIds.add(uniqueId);
    return uniqueId;
  }

  // 2. Rewrite and clean Goals
  const rawGoals = Array.isArray(rawResult.goals) ? rawResult.goals : [];
  const goals: JourneyGoal[] = rawGoals.map((g: any) => {
    const rawId = g.id || "g";
    const slug = generateSlug(g.title || "goal");
    const baseId = `${userPrefix}-g-${slug || "goal"}`;
    const newId = getUniqueId(baseId);
    goalIdMap.set(rawId, newId);

    return {
      id: newId,
      title: (g.title || "Untitled Goal").trim(),
      description: (g.description || "No description provided").trim(),
      status: g.status || "ongoing",
      topics: Array.isArray(g.topics) ? g.topics : ["Professionals"],
      subtopics: Array.isArray(g.subtopics) ? g.subtopics : ["Other"],
      startDate: normalizeDate(g.startDate) || new Date().toISOString().split("T")[0],
      endDate: normalizeDate(g.endDate) || null,
    };
  });

  // 3. Rewrite and clean Experiences
  const rawExperiences = Array.isArray(rawResult.experiences) ? rawResult.experiences : [];
  let proofCounter = 0;

  const experiences: JourneyExperience[] = rawExperiences.map((e: any) => {
    const rawId = e.id || "e";
    const slug = generateSlug(e.title || "experience");
    const baseId = `${userPrefix}-e-${slug || "experience"}`;
    const newId = getUniqueId(baseId);
    experienceIdMap.set(rawId, newId);

    // Map goalIds to their new versions
    const mappedGoalIds = (Array.isArray(e.goalIds) ? e.goalIds : [])
      .map((oldGoalId: string) => goalIdMap.get(oldGoalId))
      .filter((mappedId: string | undefined): mappedId is string => !!mappedId);

    // Map skills
    const skills = (Array.isArray(e.skills) ? e.skills : []).map((sk: any) => ({
      name: (sk.name || "Skill").trim(),
      type: sk.type || "Domain",
    }));

    // Map proofs and assign unique sequential IDs
    const proofs = (Array.isArray(e.proofs) ? e.proofs : []).map((p: any) => {
      proofCounter++;
      return {
        id: `${userPrefix}-proof-${proofCounter}`,
        sourceType: p.sourceType || "link",
        url: p.url || "public-source-unavailable",
        status: p.status || "pending",
        verifiedAt: p.verifiedAt ? normalizeDate(p.verifiedAt) : null,
        reason: p.reason || null,
      } as JourneyProof;
    });

    return {
      id: newId,
      title: (e.title || "Untitled Experience").trim(),
      startDate: normalizeDate(e.startDate) || new Date().toISOString().split("T")[0],
      endDate: normalizeDate(e.endDate) || null,
      context: (e.context || "No context provided").trim(),
      challengeFaced: e.challengeFaced ? e.challengeFaced.trim() : null,
      outcome: e.outcome ? e.outcome.trim() : null,
      organization: e.organization ? e.organization.trim() : null,
      applicationStatus: e.applicationStatus || null,
      achievements: Array.isArray(e.achievements) ? e.achievements.map((a: string) => a.trim()) : null,
      isVerified: e.isVerified ?? false,
      goalIds: mappedGoalIds,
      skills,
      proofs,
      timelineSummary: (e.timelineSummary || "No summary provided").trim(),
    };
  });

  // 4. Rewrite and clean Transitions
  const rawTransitions = Array.isArray(rawResult.transitions) ? rawResult.transitions : [];
  const transitions: JourneyTransition[] = rawTransitions
    .map((t: any) => {
      const fromId = experienceIdMap.get(t.fromExperienceId);
      const toId = experienceIdMap.get(t.toExperienceId);

      if (!fromId || !toId) {
        return null; // Skip invalid transitions where experience nodes didn't map
      }

      return {
        fromExperienceId: fromId,
        toExperienceId: toId,
        decisionLabel: (t.decisionLabel || "Transitioned to new experience").trim(),
      };
    })
    .filter((t: JourneyTransition | null): t is JourneyTransition => t !== null);

  return {
    user,
    goals,
    experiences,
    transitions,
  };
}
