import * as dotenv from "dotenv";

dotenv.config();
const {env} = process;

export const GRAPHDB_INDEX = {
    EVENT: env.EVENT || "event-index",
    PLACE: env.PLACE || "place-index",
    ORGANIZATION: env.ORGANIZATION || "organization-index",
    PERSON: env.PERSON || "person-index",
    AGENT: env.AGENT || "agent-index",
    CONCEPT: env.CONCEPT || "concept-index",
    EVENT_TYPE: env.EVENT_TYPE || "event-type-index",
    DEFAULT: env.DEFAULT || "resource-index",
    PROPERTY: env.PROPERTY || "property-index",
    TYPE: env.TYPE || "type-index",
    ENTITY: env.ENTITY || "entity-index",
    LIVE_PERFORMANCE_WORK: env.LIVE_PERFORMANCE_WORK || "live-performance-work-index",
    LABELLED_ENTITIES: env.LABELLED_ENTITIES || "labeled-entities-index",
};


