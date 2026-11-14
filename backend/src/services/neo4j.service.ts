import type { Session } from "neo4j-driver";
import { neo4jDriver } from "../config/neo4j.config.js";

export function getSession(): Session {

  return neo4jDriver.session();
}

export async function closeSession(session: Session): Promise<void> {
  await session.close();
}
