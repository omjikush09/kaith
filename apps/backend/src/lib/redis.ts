import IORedis from "ioredis";
import { ENV } from "../env";

export const redis = new IORedis(ENV.REDIS_URL, {
	maxRetriesPerRequest: null,
});
