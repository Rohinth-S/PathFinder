import "../config/env.js";
import { upstash } from "../config/upstash.config.js";
async function testUpstash() {
  try {
    console.log("Setting test key...");

    await upstash.set(
      "upstash:test",
      "hello"
    );

    console.log("Reading test key...");

    const value = await upstash.get(
      "upstash:test"
    );

    console.log("Value:", value);

    console.log("Deleting test key...");

    await upstash.del(
      "upstash:test"
    );

    console.log(
      "Upstash connection successful"
    );
  } catch (error) {
    console.error(
      "Upstash connection failed",
      error
    );
  }
}

testUpstash();