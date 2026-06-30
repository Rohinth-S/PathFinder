import { getCommunityJourney } from "../../services/community.service.js";

export async function getJourney(
  username: string
) {
  if (!username.trim()) {
    throw new Error(
      "Username is required"
    );
  }

  return getCommunityJourney(username);
}