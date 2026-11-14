import type { Request, Response } from "express";
import { clerkClient } from "@clerk/express";
import { syncUser } from "../services/auth.service.js";

export async function syncUserController(
  req: Request,
  res: Response
): Promise<void> {

  try {
   const userId = req.userId;

    console.log("Fetching user from Clerk for id:", userId);
    const user = await clerkClient.users.getUser(userId);
    console.log("Successfully fetched user from Clerk");
    const email = user.primaryEmailAddress?.emailAddress;
    const imageUrl = user.imageUrl;

    if (!email) {
      res.status(400).json({
        error: "User has no primary email",
      });
      return;
    }

    console.log("Syncing user to Neo4j");
    const syncedUser = await syncUser(user.id,email,imageUrl);
    console.log("Successfully synced user to Neo4j");
    res.json(syncedUser);

  } catch (error) {
    console.error("Error in syncUserController:", error);
    const message = error instanceof Error? error.message : String(error);
    res.status(500).json({error: message});
  }
}