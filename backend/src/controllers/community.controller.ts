import type { Request, Response } from "express";
import { getTopics } from "../processors/community/getTopics.processor.js";
import { getSubtopics } from "../processors/community/getSubtopics.processor.js";
import { searchCommunity } from "../processors/community/searchCommunity.processor.js";
import { getJourney } from "../processors/community/getJourney.processor.js";


export async function getTopicsController(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const topics = await getTopics();

    res.json({ topics });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    res.status(500).json({ error: message });
  }
}

export async function getSubtopicsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const topic = req.query.topic;

    if (typeof topic !== "string") {
      res.status(400).json({
        error: "topic query parameter is required",
      });
      return;
    }

    const subtopics = await getSubtopics(topic);

    res.json({ subtopics });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    res.status(500).json({ error: message });
  }
}

export async function searchCommunityController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const topic = typeof req.query.topic === "string" ? req.query.topic : undefined;
    const subtopic = typeof req.query.subtopic === "string" ? req.query.subtopic : undefined;
    const page = typeof req.query.page === "string" ? Number(req.query.page): 1;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    const users = await searchCommunity({ topic, subtopic, page, limit,});
    res.json(users);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
}

interface JourneyParams {
  username: string;
}

export async function getJourneyController(
  req: Request<JourneyParams>,
  res: Response
): Promise<void> {
  try {
    const { username } = req.params;
    const journey = await getJourney(username);

    res.json(journey);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    res.status(500).json({ error: message });
  }
}