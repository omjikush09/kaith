import os from "node:os";
import { Worker } from "bullmq";
import { ENV } from "./env";
import { logger } from "./lib/winston";
import { redis } from "./lib/redis";
import { EXECUTION_QUEUE, type ExecutionJobData } from "./lib/queue";
import {
	TRIGGER_QUEUE,
	syncAllSchedules,
	syncPendingExecutions,
	type TriggerJobData,
} from "./apps/trigger";
import { runWorkflow } from "./engine/runner";
import { enqueueExecutionService } from "./services/execution";
import "./apps";

const concurrency = ENV.WORKER_CONCURRENCY ?? os.availableParallelism();

const worker = new Worker<ExecutionJobData>(
	EXECUTION_QUEUE,
	async (job) => {
		const { executionId } = job.data;
		logger.info(`[worker] picking up execution=${executionId} job=${job.id}`);
		await runWorkflow(executionId);
	},
	{
		connection: redis,
		concurrency,
		autorun: false,
	},
);

worker.on("completed", (job) => {
	logger.info(
		`[worker] completed job=${job.id} execution=${job.data.executionId}`,
	);
});

worker.on("failed", (job, err) => {
	logger.error(
		`[worker] failed job=${job?.id} execution=${job?.data.executionId}: ${err.message}`,
	);
});

const triggerWorker = new Worker<TriggerJobData>(
	TRIGGER_QUEUE,
	async (job) => {
		const { workflowId, nodeId } = job.data;
		logger.info(
			`[trigger] firing schedule workflow=${workflowId} node=${nodeId}`,
		);
		const execution = await enqueueExecutionService({
			workflowId,
			triggerNodeId: nodeId,
			payload: {
				trigger: "schedule",
				nodeId,
				firedAt: new Date().toISOString(),
			},
		});
		if (!execution) {
			logger.warn(`[trigger] workflow=${workflowId} not found, skipping`);
		}
	},
	{ connection: redis, concurrency: 4, autorun: false },
);

triggerWorker.on("failed", (job, err) => {
	logger.error(
		`[trigger] failed job=${job?.id} workflow=${job?.data.workflowId}: ${err.message}`,
	);
});

logger.info(`[worker] booting with concurrency=${concurrency}`);

try {
	await syncAllSchedules();
	await syncPendingExecutions();
} catch (err) {
	logger.error(`[worker] startup sync failed: ${err}`);
	process.exit(1);
}

worker.run();
triggerWorker.run();
logger.info("[worker] sync done; processing jobs");

const shutdown = async (signal: string) => {
	logger.info(`[worker] received ${signal}, draining…`);
	await Promise.all([worker.close(), triggerWorker.close()]);
	await redis.quit();
	process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
