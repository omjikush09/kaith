import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/winston";
import { executionQueue } from "../lib/queue";

type StartInput = {
	workflowId: string;
	triggerNodeId?: string;
	payload?: unknown;
	// Manual triggers can run drafts; schedule/webhook require the workflow
	// to be active.
	allowDraft?: boolean;
};

const startExecutionService = async (input: StartInput) => {
	try {
		const workflow = await prisma.workFlow.findUnique({
			where: { id: input.workflowId },
		});
		if (!workflow) return null;
		if (!input.allowDraft && workflow.status !== "active") return null;

		return await prisma.execution.create({
			data: {
				name: workflow.name,
				status: "pending",
				workflowId: workflow.id,
				flowSnapShot: {
					nodes: workflow.nodes ?? [],
					edges: workflow.edges ?? [],
					trigger: input.payload ?? null,
					triggerNodeId: input.triggerNodeId ?? null,
				},
			},
		});
	} catch (error) {
		logger.error(`Error in startExecutionService: ${error}`);
		throw error;
	}
};

const enqueueExecutionService = async (input: StartInput) => {
	const execution = await startExecutionService(input);
	if (!execution) return null;
	await executionQueue.add(
		"run",
		{ executionId: execution.id },
		{ jobId: execution.id },
	);
	return execution;
};

const getExecutionByIdService = async (id: string) => {
	try {
		return await prisma.execution.findUnique({
			where: { id },
			include: { steps: { orderBy: { index: "asc" } } },
		});
	} catch (error) {
		logger.error(`Error in getExecutionByIdService: ${error}`);
		throw error;
	}
};

const listExecutionsService = async (filters: {
	workflowId?: string;
	status?: string;
	page: number;
	limit: number;
}) => {
	try {
		const where: Prisma.ExecutionWhereInput = {};
		if (filters.workflowId) where.workflowId = filters.workflowId;
		if (filters.status) where.status = filters.status;

		const skip = (filters.page - 1) * filters.limit;
		const [items, total] = await prisma.$transaction([
			prisma.execution.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip,
				take: filters.limit,
			}),
			prisma.execution.count({ where }),
		]);

		return {
			items,
			total,
			page: filters.page,
			limit: filters.limit,
			totalPages: Math.max(1, Math.ceil(total / filters.limit)),
		};
	} catch (error) {
		logger.error(`Error in listExecutionsService: ${error}`);
		throw error;
	}
};

export {
	startExecutionService,
	enqueueExecutionService,
	getExecutionByIdService,
	listExecutionsService,
};
