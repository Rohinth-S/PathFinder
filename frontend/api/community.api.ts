import { apiFetch } from "./api";

export interface SearchCommunityUser {
  username: string;
  reputationScore: number;
  topics: string[];
  subtopics: string[];
  experienceCount: number;
  latestExperience: {
    title: string;
    timelineSummary: string;
    organization: string;
    isVerified: boolean;
  } | null;
}

export interface CommunityJourney {
  user: {
    username: string;
    reputationScore: number;
  };
  goals: {
    id: string;
    title: string;
    description: string;
    status: string;
    topics: string[];
    subtopics: string[];
    startDate: string | null;
    endDate: string | null;
  }[];
  experiences: {
    id: string;
    title: string;
    timelineSummary: string;
    startDate: string | null;
    endDate: string | null;
    context: string;
    challengeFaced: string | null;
    outcome: string | null;
    organization: string;
    applicationStatus: string | null;
    achievements: string[] | null;
    isVerified: boolean;
    skills: { name: string; type: string | null }[];
    goals: { id: string; title: string }[];
    transition: { toExperienceId: string; decisionLabel: string | null } | null;
  }[];
}

export async function getTopics(): Promise<string[]> {
  const data = await apiFetch<{ topics: string[] }>("/community/topics", { method: "GET" });
  return data.topics;
}

export async function getSubtopics(topic: string): Promise<string[]> {
  const data = await apiFetch<{ subtopics: string[] }>(`/community/subtopics?topic=${encodeURIComponent(topic)}`, { method: "GET" });
  return data.subtopics;
}

export async function searchCommunity(params: {
  topic?: string;
  subtopic?: string;
  page?: number;
  limit?: number;
}): Promise<SearchCommunityUser[]> {
  const query = new URLSearchParams();
  if (params.topic) query.append("topic", params.topic);
  if (params.subtopic) query.append("subtopic", params.subtopic);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  
  const queryString = query.toString();
  return apiFetch<SearchCommunityUser[]>(`/community${queryString ? `?${queryString}` : ""}`, { method: "GET" });
}

export async function getCommunityJourney(username: string): Promise<CommunityJourney> {
  return apiFetch<CommunityJourney>(`/community/journey/${encodeURIComponent(username)}`, { method: "GET" });
}
