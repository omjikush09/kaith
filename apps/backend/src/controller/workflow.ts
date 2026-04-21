import { Request, Response } from "express";
import {
	workFlowCreateInputType,
	workFlowDeleteInputType,
	workFlowGetByIdInputType,
	workFlowListInputType,
	workFlowUpdateInputType,
} from "../schema/workflow";
import {
	createWorkflowService,
	deleteWorkflowService,
	getWorkflowByIdService,
	listWorkflowsService,
	updateWorkflowService,
} from "../services/workflow";
import {
	removeWorkflowSchedules,
	syncWorkflowSchedules,
} from "../apps/trigger";
import { BadRequestError, InternalServerError } from "../lib/error";
import { logger } from "../lib/winston";
import type { FlowNode } from "../engine/types";

const assertUniqueNodeNames = (nodes: unknown) => {
	if (!Array.isArray(nodes)) return;
	const seen = new Set<string>();
	for (const n of nodes as FlowNode[]) {
		const label = n.data?.label?.trim();
		if (!label) {
			throw new BadRequestError("Every node must have a name", 400);
		}
		if (seen.has(label)) {
			throw new BadRequestError(`Duplicate node name "${label}"`, 400);
		}
		seen.add(label);
	}
};

const createWorkFlow = async (
	req: Request<{}, {}, workFlowCreateInputType["body"]>,
	res: Response,
) => {
	try {
		assertUniqueNodeNames(req.body.nodes);
		const workflow = await createWorkflowService(req.body);
		if (workflow.status === "active") {
			await syncWorkflowSchedules(workflow);
		}
		return res.status(201).json({
			success: true,
			message: "Workflow created successfully",
			data: workflow,
		});
	} catch (error) {
		if (error instanceof BadRequestError) throw error;
		logger.error(`Error in createWorkFlow: ${error}`);
		throw new InternalServerError();
	}
};

const listWorkFlows = async (req: Request, res: Response) => {
	try {
		const query = req.query as unknown as NonNullable<
			workFlowListInputType["query"]
		>;
		const { items, total, page, limit, totalPages } =
			await listWorkflowsService({
				userId: query?.userId,
				search: query?.search,
				page: query?.page ?? 1,
				limit: query?.limit ?? 20,
			});
		return res.status(200).json({
			success: true,
			data: items,
			pagination: { total, page, limit, totalPages },
		});
	} catch (error) {
		logger.error(`Error in listWorkFlows: ${error}`);
		throw new InternalServerError();
	}
};

const getWorkFlowById = async (
	req: Request<workFlowGetByIdInputType["params"]>,
	res: Response,
) => {
	try {
		const workflow = await getWorkflowByIdService(req.params.id);
		if (!workflow) {
			throw new BadRequestError("Workflow not found", 404);
		}
		return res.status(200).json({
			success: true,
			data: workflow,
		});
	} catch (error) {
		if (error instanceof BadRequestError) throw error;
		logger.error(`Error in getWorkFlowById: ${error}`);
		throw new InternalServerError();
	}
};

const updateWorkFlow = async (
	req: Request<
		workFlowUpdateInputType["params"],
		{},
		workFlowUpdateInputType["body"]
	>,
	res: Response,
) => {
	try {
		if (req.body.nodes !== undefined) assertUniqueNodeNames(req.body.nodes);
		const workflow = await updateWorkflowService(req.params.id, req.body);
		if (workflow.status === "active") {
			await syncWorkflowSchedules(workflow);
		} else {
			// status flipped to draft/error — tear down any schedules we had installed
			await removeWorkflowSchedules(workflow.id);
		}
		return res.status(200).json({
			success: true,
			message: "Workflow updated successfully",
			data: workflow,
		});
	} catch (error) {
		if (error instanceof BadRequestError) throw error;
		logger.error(`Error in updateWorkFlow: ${error}`);
		throw new InternalServerError();
	}
};

const deleteWorkFlow = async (
	req: Request<workFlowDeleteInputType["params"]>,
	res: Response,
) => {
	try {
		await removeWorkflowSchedules(req.params.id);
		await deleteWorkflowService(req.params.id);
		return res.status(204).send();
	} catch (error) {
		logger.error(`Error in deleteWorkFlow: ${error}`);
		throw new InternalServerError();
	}
};

export {
	createWorkFlow,
	listWorkFlows,
	getWorkFlowById,
	updateWorkFlow,
	deleteWorkFlow,
};
