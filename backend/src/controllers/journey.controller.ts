import type { Request, Response } from "express";
import { extractJourney } from "../processors/journey/extractJourney.processor.js";

export async function extractJourneyController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { journey, user } = req.body;

    if (!journey || typeof journey !== "string") {
      res.status(400).json({ error: "Missing or invalid 'journey' parameter in request body." });
      return;
    }

    const extractedGraph = await extractJourney(journey, user);

    res.json({
      extractedGraph,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: `Failed to extract journey: ${message}` });
  }
}
