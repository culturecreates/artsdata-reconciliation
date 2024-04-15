import * as dotenv from "dotenv";

dotenv.config();
const { env } = process;

export const ARTSDATA: { ENDPOINT: string } = {
  ENDPOINT: env.ARTSDATA_ENDPOINT || "https://db.artsdata.ca/"
};
