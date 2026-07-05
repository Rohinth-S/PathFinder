import { apiFetch } from "./api";

export interface JourneyExperience {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  context: string;
  challengeFaced: string | null;
  outcome: string | null;
  organization: string | null;
  applicationStatus: string | null;
  achievements: string[];
  isVerified: boolean;
  goalIds: string[];
  skills: { name: string; type: string | null }[];
  proofs: { id: string; sourceType: string; url: string; status: string; verifiedAt: string | null; reason: string | null }[];
  timelineSummary: string;
}

export interface JourneyGoal {
  id: string;
  title: string;
  description: string;
  status: string;
  topics: string[];
  subtopics: string[];
  startDate: string;
  endDate: string | null;
}

export interface JourneyTransition {
  fromExperienceId: string;
  toExperienceId: string;
  decisionLabel: string;
}

export interface JourneyUser {
  username: string;
  clerkId: string | null;
  preferredLanguage: string;
  reputationScore: number;
  flagCount: number;
  isFlagged: boolean;
  email: string | null;
}

export interface UserJourneyResponse {
  journey: {
    user: JourneyUser;
    goals: JourneyGoal[];
    experiences: JourneyExperience[];
    transitions: JourneyTransition[];
  } | null;
  metadata: {
    lastUpdated?: string;
  };
}

export interface ExtractJourneyResponse {
  success: boolean;
  data?: any;
  staticAnalysis?: {
    success: boolean;
    issues: any[];
  };
  error?: string;
}

/**
 * Fetch the authenticated user's own journey.
 */
export async function getUserJourney(
  token: string
): Promise<UserJourneyResponse> {
  return apiFetch<UserJourneyResponse>(
    "/user/journey",
    { method: "GET" },
    token
  );
}

/**
 * Submit a journey narrative for extraction and graph creation.
 */
export async function extractJourney(
  token: string,
  journeyText: string,
  userData?: { username?: string }
): Promise<ExtractJourneyResponse> {
  return apiFetch<ExtractJourneyResponse>(
    "/journey/extract",
    {
      method: "POST",
      body: JSON.stringify({
        journey: journeyText,
        user: userData || {},
      }),
    },
    token
  );
}
