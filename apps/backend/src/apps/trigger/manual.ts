import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { enqueueExecutionService } from "../../services/execution";
import { BadRequestError, InternalServerError } from "../../lib/error";
import { logger } from "../../lib/winston";
import { executionStartInputType } from "../../schema/execution";
import type { FlowNode } from "../../engine/types";

const triggerManual = async (
	req: Request<{}, {}, executionStartInputType["body"]>,
	res: Response,
) => {
	try {
		const { workflowId, nodeId, payload } = req.body;

		const workflow = await prisma.workFlow.findUnique({
			where: { id: workflowId },
			select: { id: true, nodes: true },
		});
		if (!workflow) throw new BadRequestError("Workflow not found", 404);

		const nodes = (workflow.nodes ?? []) as FlowNode[];
		const manualNodes = nodes.filter((n) => n.data?.appType === "manual");

		let triggerNodeId = nodeId;
		if (triggerNodeId) {
			const node = nodes.find((n) => n.id === triggerNodeId);
			if (!node || node.data?.appType !== "manual") {
				throw new BadRequestError("Manual trigger not found", 404);
			}
		} else {
			if (manualNodes.length === 0) {
				throw new BadRequestError("Workflow has no manual trigger", 400);
			}
			if (manualNodes.length > 1) {
				throw new BadRequestError(
					"Workflow has multiple manual triggers; specify nodeId",
					400,
				);
			}
			triggerNodeId = manualNodes[0].id;
		}

		const execution = await enqueueExecutionService({
			workflowId,
			triggerNodeId,
			payload,
			allowDraft: true,
		});
		if (!execution) throw new BadRequestError("Workflow not found", 404);

		return res.status(202).json({
			success: true,
			message: "Execution queued",
			data: { executionId: execution.id, status: execution.status },
		});
	} catch (error) {
		if (error instanceof BadRequestError) throw error;
		logger.error(`Error in triggerManual: ${error}`);
		throw new InternalServerError();
	}
};

export { triggerManual };
