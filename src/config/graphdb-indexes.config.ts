import * as dotenv from "dotenv";

dotenv.config();
const { env } = process;

export const GRAPHDB_INDEX  = {
  EVENT: env.EVENT || "event-index",
  PLACE: env.PLACE || "place-index",
  ORGANIZATION: env.ORGANIZATION || "organization-index",
  PERSON: env.PERSON || "person-index",
  AGENT: env.AGENT || "agent-index",
  CONCEPT: env.CONCEPT || "concept-index",
  EVENT_TYPE: env.EVENT_TYPE || "event-type-index",
  DEFAULT: env.DEFAULT || "resource-index",
};


