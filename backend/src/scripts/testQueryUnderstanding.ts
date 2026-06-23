import "../config/env.js";

import { understandQuery } from "../processors/query/understandQuery.processor.js";

async function main(): Promise<void> {
  const query =
    "I want to understand what people usually did before launching a successful SaaS company.";
  console.log("Input Query:\n");
  console.log(query);

  console.log("\nGenerating structured query...\n");

  const result = await understandQuery(query);

  console.log(
    JSON.stringify(result, null, 2)
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : String(error);

  console.error(
    "\n✗ query understanding failed"
  );

  console.error(message);

  process.exitCode = 1;
});
