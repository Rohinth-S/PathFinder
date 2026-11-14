import { apiFetch } from "./api";

export interface SyncedUser {
  clerkId: string;
  email: string;
  username: string | null;
  preferredLanguage: string | null;
  reputationScore: number;
  flagCount: number;
  isFlagged: boolean;
}

export async function syncUser(
  token: string
): Promise<SyncedUser> {

  return apiFetch<SyncedUser>(
    "/auth/sync",{method: "POST"},token);
}

export async function updateProfile(
  token: string,
  body: {
    username?: string;
    preferredLanguage?: string;
  }
): Promise<SyncedUser> {

  return apiFetch<SyncedUser>(
    "/user/profile",
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    token
  );
}