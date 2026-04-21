import z from "zod";
import dotenv from "dotenv";

dotenv.config();

const env_schema = {
	PORT: process.env.PORT || 8080,
	REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
	WORKER_CONCURRENCY: process.env.WORKER_CONCURRENCY,
};

const schema = z.object({
	PORT: z.coerce.number().default(8080),
	REDIS_URL: z.string().url().default("redis://127.0.0.1:6379"),
	WORKER_CONCURRENCY: z.coerce.number().int().min(1).optional(),
});

const ENV = schema.parse(env_schema);
export { ENV };
