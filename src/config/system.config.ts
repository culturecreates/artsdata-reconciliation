import * as dotenv from "dotenv";

dotenv.config();
const {env} = process;

export const ARTSDATA: {
    ENDPOINT: string,
    REPOSITORY: string,
    USER: string | undefined,
    PASSWORD: string | undefined
} = {
    ENDPOINT: env.ARTSDATA_ENDPOINT || "https://staging.db.artsdata.ca/",
    REPOSITORY: env.REPOSITORY || "artsdata",
    USER: env.ARTSDATA_USER,
    PASSWORD: env.ARTSDATA_PASSWORD
};

export const APPLICATION = {
    HTTP_PORT: Number(env.APP_PORT) || 3000,
    HTTPS_PORT: Number(env.APP_PORT) || 443,
    KG_URL: env.KG_URL || "http://kg.artsdata.ca/resource/",
};

export const FEATURE_FLAG = {
    ENABLE_EVENT_BATCH_RECONCILIATION: env.ENABLE_EVENT_BATCH_RECONCILIATION === "true",
    LOG_QUERIES: env.LOG_QUERIES === "true"
};