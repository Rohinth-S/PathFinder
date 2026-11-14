import { searchCommunityUsers } from "../../services/community.service.js";

export interface SearchCommunityInput {
  topic: string | undefined;
  subtopic: string | undefined;
  page: number;
  limit: number;
}

export async function searchCommunity(
  input: SearchCommunityInput
) {
  const page = Math.max(1, input.page);
  const limit = Math.min(
    Math.max(1, input.limit),
    50
  );

  return searchCommunityUsers({
    topic: input.topic,
    subtopic: input.subtopic,
    page,
    limit,
  });
}