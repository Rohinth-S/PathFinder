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

export interface UserJourneyStatistics {
  goals: number;
  experiences: number;
  transitions: number;
}

export interface UserJourneyResponse {
  username: string;
  statistics: UserJourneyStatistics;
  goals: JourneyGoal[];
  experiences: JourneyExperience[];
  transitions: JourneyTransition[];
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

export interface StartJourneyResponse {
  success: boolean;
  message: string;
  conversationId: string;
}

export interface SendMessageResponse {
  success: boolean;
  conversationId: string;
  journeyDraft: any;
}

export interface SubmitJourneyResponse {
  success: boolean;
  goals: any[];
  experiences: any[];
  transitions: any[];
}

/**
 * Start a new journey onboarding session
 */
export async function startJourneySession(token: string): Promise<StartJourneyResponse> {
  return apiFetch<StartJourneyResponse>("/journey/start", { method: "POST" }, token);
}

/**
 * Send a message to the AI onboarding assistant
 */
export async function sendJourneyMessage(
  token: string,
  conversationId: string,
  message: string
): Promise<SendMessageResponse> {
  return apiFetch<SendMessageResponse>(
    "/journey/message",
    {
      method: "POST",
      body: JSON.stringify({ conversationId, message }),
    },
    token
  );
}

/**
 * Submit the final parsed journey draft for graph creation
 */
export async function submitJourney(
  token: string,
  conversationId: string,
  journeyPayload: any
): Promise<SubmitJourneyResponse> {
  return apiFetch<SubmitJourneyResponse>(
    "/journey/submit",
    {
      method: "POST",
      body: JSON.stringify({ conversationId, ...journeyPayload }),
    },
    token
  );
}
