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
  proofs: { id: string; sourceType: string; url?: string; localUri?: string; status: string; verifiedAt: string | null; reason: string | null; filename?: string; mimeType?: string }[];
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
  journeyDraft: {
    goals: JourneyGoal[];
    experiences: any[];
  };
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

export interface SubmitGoalResponse {
  success: boolean;
  id: string;
  title: string;
}

/**
 * Submit a new goal manually during onboarding
 */
export async function submitJourneyGoal(
  token: string,
  goalPayload: {
    title: string;
    description?: string;
    status: string;
    topics: string[];
    subtopics: string[];
    startDate?: string;
    endDate?: string;
  }
): Promise<SubmitGoalResponse> {
  return apiFetch<SubmitGoalResponse>(
    "/journey/submit/goal",
    {
      method: "POST",
      body: JSON.stringify({ goal: goalPayload }),
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
  journeyPayload: any,
  files?: { id: string; uri: string; name: string; type: string }[]
): Promise<SubmitJourneyResponse> {
  if (files && files.length > 0) {
    const formData = new FormData();
    
    // Append 'journey' as a JSON string containing conversationId and the payload
    formData.append('journey', JSON.stringify({ conversationId, ...journeyPayload }));
    
    files.forEach(f => {
      formData.append(f.id, {
        uri: f.uri,
        name: f.name,
        type: f.type,
      } as any);
    });

    return apiFetch<SubmitJourneyResponse>(
      "/journey/submit",
      {
        method: "POST",
        body: formData,
      },
      token,
      true // isMultipart
    );
  }

  return apiFetch<SubmitJourneyResponse>(
    "/journey/submit",
    {
      method: "POST",
      body: JSON.stringify({ journey: JSON.stringify({ conversationId, ...journeyPayload }) }),
    },
    token
  );
}
