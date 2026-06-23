import type {Request,Response} from "express";
import { understandQuery } from "../processors/query/understandQuery.processor.js";
import { retrieveContext } from "../processors/query/retrieveContext.processor.js";
import { aggregateContext } from "../processors/query/aggregateContext.processor.js";

export async function queryController(req: Request,res: Response): Promise<void> {
  const { query } = req.body;
  if (
    typeof query !== "string" || !query.trim()
  ) {
    res.status(400).json({
      error: "Query is required",
    });
    return;
  }

  const structuredQuery = await understandQuery(query);
  const context = await retrieveContext(structuredQuery);
  const aggregatedContext =await aggregateContext(query,structuredQuery,context);
  res.json({structuredQuery,context,aggregatedContext});
}