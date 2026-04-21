import { Queue } from "bullmq";
import { redis } from "../../lib/redis";
import { logger } from "../../lib/winston";
import { prisma } from "../../lib/prisma";
import { executionQueue } from "../../lib/queue";
import type { WorkFlow } from "../../generated/prisma/client";
import type { FlowNode } from "../../engine/types";

type ScheduleInput = Pick<WorkFlow, "id" | "nodes">;

export type TriggerJobData = { workflowId: string; nodeId: string };

export type ScheduleConfig = {
	cron?: string;
	timezone?: string;
};

export const TRIGGER_QUEUE = "workflow-triggers";

export const triggerQueue = new Queue<TriggerJobData>(TRIGGER_QUEUE, {
	connection: redis,
});

const schedulerId = (workflowId: string, nodeId: string) =>
	`schedule:${workflowId}:${nodeId}`;

const scheduleConfig = (node: FlowNode): ScheduleConfig =>
	(node.data?.config ?? {}) as ScheduleConfig;

export const syncWorkflowSchedules = async (workflow: ScheduleInput) => {
	const nodes = (workflow.nodes ?? []) as FlowNode[];
	const scheduleNodes = nodes.filter((n) => n.data?.appType === "schedule");
	const desiredIds = new Set(
		scheduleNodes.map((n) => schedulerId(workflow.id, n.id)),
	);

	const prefix = `schedule:${workflow.id}:`;
	const existing = await triggerQueue.getJobSchedulers();
	for (const s of existing) {
		const key = s.key ?? s.id;
		if (key && key.startsWith(prefix) && !desiredIds.has(key)) {
			await triggerQueue.removeJobScheduler(key);
		}
	}

	for (const node of scheduleNodes) {
		const cfg = scheduleConfig(node);
		const cron = (cfg.cron ?? "").trim();
		if (!cron) continue;
		const tz = cfg.timezone;
		try {
			await triggerQueue.upsertJobScheduler(
				schedulerId(workflow.id, node.id),
				{ pattern: cron, tz },
				{
					name: "fire",
					data: { workflowId: workflow.id, nodeId: node.id },
				},
			);
		} catch (err) {
			logger.error(
				`Failed to schedule ${workflow.id}/${node.id} cron=${cron}: ${err}`,
			);
		}
	}
};

export const removeWorkflowSchedules = async (workflowId: string) => {
	const prefix = `schedule:${workflowId}:`;
	const existing = await triggerQueue.getJobSchedulers();
	for (const s of existing) {
		const key = s.key ?? s.id;
		if (key && key.startsWith(prefix)) {
			await triggerQueue.removeJobScheduler(key);
		}
	}
};

export const syncPendingExecutions = async () => {
	logger.info("[sync] re-enqueueing pending executions…");
	const pending = await prisma.execution.findMany({
		where: { status: "pending" },
		select: { id: true },
	});
	let added = 0;
	for (const e of pending) {
		const existing = await executionQueue.getJob(e.id);
		if (!existing) {
			await executionQueue.add(
				"run",
				{ executionId: e.id },
				{ jobId: e.id },
			);
			added++;
		}
	}
	logger.info(
		`[sync] ${pending.length} pending execution(s); ${added} re-enqueued`,
	);
};

export const syncAllSchedules = async () => {
	logger.info("[scheduler] rehydrating cron schedulers from Postgres…");
	const existing = await triggerQueue.getJobSchedulers();
	const liveIds = new Set<string>();

	const PAGE = 200;
	let cursor: string | undefined;
	let total = 0;
	let totalCron = 0;

	while (true) {
		const batch = await prisma.workFlow.findMany({
			take: PAGE,
			...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
			orderBy: { id: "asc" },
			select: { id: true, nodes: true },
		});
		if (batch.length === 0) break;

		for (const wf of batch) {
			total++;
			const nodes = (wf.nodes ?? []) as FlowNode[];
			for (const n of nodes) {
				if (n.data?.appType !== "schedule") continue;
				const cron = (scheduleConfig(n).cron ?? "").trim();
				if (!cron) continue;
				liveIds.add(`schedule:${wf.id}:${n.id}`);
				totalCron++;
			}
			await syncWorkflowSchedules(wf);
		}

		cursor = batch[batch.length - 1]!.id;
		if (batch.length < PAGE) break;
	}

	for (const s of existing) {
		const key = s.key ?? s.id;
		if (key && key.startsWith("schedule:") && !liveIds.has(key)) {
			await triggerQueue.removeJobScheduler(key);
		}
	}

	logger.info(
		`[scheduler] rehydrated ${totalCron} schedule(s) across ${total} workflow(s)`,
	);
};
