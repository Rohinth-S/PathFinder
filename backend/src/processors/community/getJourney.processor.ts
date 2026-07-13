import { getCommunityJourney } from "../../services/community.service.js";

export async function getJourney(
  username: string,
  userId?: string
) {
  if (!username) {
    throw new Error("username is required");
  }

  return getCommunityJourney(username, userId);
}