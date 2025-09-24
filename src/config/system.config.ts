import * as dotenv from "dotenv";

dotenv.config();
const { env } = process;

export const ARTSDATA: { ENDPOINT: string, REPOSITORY: string } = {
  ENDPOINT: env.ARTSDATA_ENDPOINT || "https://staging.db.artsdata.ca/",
  REPOSITORY: env.REPOSITORY || "artsdata"
};

export const APPLICATION = {
  HTTP_PORT: Number(env.APP_PORT) || 3000,
  HTTPS_PORT: Number(env.APP_PORT) || 443
};

export const FEATURE_FLAG = {
  ENABLE_EVENT_BATCH_RECONCILIATION: Boolean(env.ENABLE_EVENT_BATCH_RECONCILIATION) || false
};
