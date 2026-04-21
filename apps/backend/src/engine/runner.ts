import { prisma } from "../lib/prisma";
import { logger } from "../lib/winston";
import { getNodeHandler } from "./registry";
import { interpolate } from "./template";
import type { FlowEdge, WorkflowSnapshot } from "./types";

const claimExecution = async (executionId: string): Promise<boolean> => {
	return await prisma.$transaction(async (tx) => {
		const rows = await tx.$queryRaw<{ id: string }[]>`
			SELECT id FROM "executions"
			WHERE id = ${executionId} AND status = 'pending'
			FOR UPDATE SKIP LOCKED
		`;
		if (rows.length === 0) return false;
		await tx.execution.update({
			where: { id: executionId },
			data: { status: "running", startedAt: new Date() },
		});
		return true;
	});
};

const childrenOf = (
	nodeId: string,
	edges: FlowEdge[],
	branch?: string,
): string[] =>
	edges
		.filter((e) => {
			if (e.source !== nodeId) return false;
			if (!branch) return true;
			const sh = (e as unknown as { sourceHandle?: string }).sourceHandle;
			return sh ? sh === branch : true;
		})
		.map((e) => e.target);

export const runWorkflow = async (executionId: string): Promise<void> => {
	const claimed = await claimExecution(executionId);
	if (!claimed) {
		logger.warn(`Execution ${executionId} already claimed; skipping`);
		return;
	}

	const execution = await prisma.execution.findUniqueOrThrow({
		where: { id: executionId },
	});

	const snapshot = execution.flowSnapShot as WorkflowSnapshot;
	const nodes = snapshot.nodes ?? [];
	const edges = snapshot.edges ?? [];
	const nodeById = new Map(nodes.map((n) => [n.id, n]));

	if (!snapshot.triggerNodeId || !nodeById.has(snapshot.triggerNodeId)) {
		await prisma.execution.update({
			where: { id: executionId },
			data: {
				status: "failed",
				error: "Execution has no trigger node",
				finishedAt: new Date(),
			},
		});
		throw new Error(`Execution ${executionId} has no trigger node`);
	}

	let stepIndex = 0;
	const outputs = new Map<string, unknown>();
	const queue: string[] = [snapshot.triggerNodeId];
	const visited = new Set<string>();

	try {
		while (queue.length > 0) {
			const nodeId = queue.shift()!;
			if (visited.has(nodeId)) continue;
			visited.add(nodeId);

			const node = nodeById.get(nodeId);
			if (!node) continue;

			const handlerKey = node.data?.appType ?? node.type ?? "manual";
			const handler = getNodeHandler(handlerKey);
			const parents = edges
				.filter((e) => e.target === nodeId)
				.map((e) => e.source);
			const nameOf = (pid: string) =>
				nodeById.get(pid)?.data?.label?.trim() || pid;
			const input =
				parents.length === 0
					? (snapshot.trigger ?? null)
					: parents.length === 1
						? (outputs.get(parents[0]!) ?? null)
						: parents.reduce<Record<string, unknown>>((acc, pid) => {
								acc[nameOf(pid)] = outputs.get(pid) ?? null;
								return acc;
							}, {});

			const nodesByName: Record<string, unknown> = {};
			for (const [pid, out] of outputs) {
				const key = nodeById.get(pid)?.data?.label?.trim() || pid;
				nodesByName[key] = out;
			}
			const ctx = {
				$input: input,
				$json: input,
				$trigger: snapshot.trigger ?? null,
				$nodes: nodesByName,
			};
			console.log("ctx", ctx);
			console.log("config",node.data?.config);
			const config = interpolate(
				(node.data?.config ?? {}) as Record<string, unknown>,
				ctx,
			);

			const step = await prisma.steps.create({
				data: {
					executionId,
					nodeId,
					index: stepIndex++,
					type: handlerKey,
					status: "running",
					metadata: { label: (node.data as { label?: string })?.label ?? null },
					input: input as never,
					output: {} as never,
					startedAt: new Date(),
				},
			});

			try {
				if (!handler)
					throw new Error(`No handler for node type "${handlerKey}"`);
				const output = await handler(input, config, {
					executionId,
					workflowId: execution.workflowId,
					nodeId,
					logger,
					trigger: snapshot.trigger ?? null,
					nodes: nodesByName,
				});
				outputs.set(nodeId, output);
				await prisma.steps.update({
					where: { id: step.id },
					data: {
						status: "success",
						output: (output ?? null) as never,
						finishedAt: new Date(),
					},
				});
				const branch = (output as { branch?: string } | null)?.branch;
				for (const child of childrenOf(nodeId, edges, branch)) {
					queue.push(child);
				}
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				await prisma.steps.update({
					where: { id: step.id },
					data: {
						status: "failed",
						error: message,
						finishedAt: new Date(),
					},
				});
				throw err;
			}
		}

		await prisma.execution.update({
			where: { id: executionId },
			data: { status: "success", finishedAt: new Date() },
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		await prisma.execution.update({
			where: { id: executionId },
			data: {
				status: "failed",
				error: message,
				finishedAt: new Date(),
			},
		});
		throw err;
	}
};
