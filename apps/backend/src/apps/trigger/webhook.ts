import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { enqueueExecutionService } from "../../services/execution";
import { BadRequestError, InternalServerError } from "../../lib/error";
import { logger } from "../../lib/winston";
import type { FlowNode } from "../../engine/types";

const triggerWebhook = async (
	req: Request<{ workflowId: string; nodeId: string }>,
	res: Response,
) => {
	try {
		const { workflowId, nodeId } = req.params;
		const workflow = await prisma.workFlow.findUnique({
			where: { id: workflowId },
		});
		if (!workflow) throw new BadRequestError("Workflow not found", 404);

		const nodes = (workflow.nodes ?? []) as FlowNode[];
		const node = nodes.find((n) => n.id === nodeId);
		if (!node || node.data?.appType !== "webhook") {
			throw new BadRequestError("Webhook trigger not found", 404);
		}

		const execution = await enqueueExecutionService({
			workflowId,
			triggerNodeId: nodeId,
			payload: {
				method: req.method,
				headers: req.headers,
				query: req.query,
				body: req.body,
			},
		});
		if (!execution) {
			throw new BadRequestError("Workflow is not active", 409);
		}

		return res.status(202).json({
			success: true,
			data: { executionId: execution.id },
		});
	} catch (error) {
		if (error instanceof BadRequestError) throw error;
		logger.error(`Error in triggerWebhook: ${error}`);
		throw new InternalServerError();
	}
};

export { triggerWebhook };
