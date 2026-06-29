import { syncUser, updateProfile } from "../api/auth.api";

export async function initializeUser(
  token: string
) {
  return syncUser(token);
}

export async function updateUserProfile(
  token: string,
  username?: string,
  preferredLanguage?: string
) {
  return updateProfile(token, {
    username,
    preferredLanguage,
  });
}