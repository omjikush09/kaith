import { Queue } from "bullmq";
import { redis } from "./redis";

export type ExecutionJobData = { executionId: string };

export const EXECUTION_QUEUE = "workflow-executions";

export const executionQueue = new Queue<ExecutionJobData>(EXECUTION_QUEUE, {
	connection: redis,
	defaultJobOptions: {
		attempts: 3,
		backoff: { type: "exponential", delay: 2_000 },
		removeOnComplete: { age: 3_600, count: 1_000 },
		removeOnFail: { age: 24 * 3_600 },
	},
});
