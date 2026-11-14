import { getGlobalFeed, type FeedExperience } from "../../services/community.service.js";

export async function getFeed(
  userId?: string,
  page = 1,
  limit = 20
): Promise<FeedExperience[]> {
  const p = Math.max(1, page);
  const l = Math.min(Math.max(1, limit), 50);

  return getGlobalFeed(userId, p, l);
}
