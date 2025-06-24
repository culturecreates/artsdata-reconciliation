import * as dotenv from "dotenv";

dotenv.config();
const { env } = process;

export const ARTSDATA: { ENDPOINT: string, REPOSITORY: string } = {
  ENDPOINT: env.ARTSDATA_ENDPOINT || "https://staging.recon.artsdata.ca:7200/",
  REPOSITORY: env.REPOSITORY || "artsdata"
};

export const APPLICATION = {
  HTTP_PORT: Number(env.APP_PORT) || 3000,
  HTTPS_PORT: Number(env.APP_PORT) || 443
};
