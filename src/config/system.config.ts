import * as dotenv from "dotenv";

dotenv.config();
const { env } = process;

export const ARTSDATA: { ENDPOINT: string } = {
  ENDPOINT: env.ARTSDATA_ENDPOINT || "https://db.artsdata.ca/"
};

export const APPLICATION = {
  HTTP_PORT: Number(env.APP_PORT) || 3000,
  HTTPS_PORT: Number(env.APP_PORT) || 443
};
