import { Request, Response } from "express";
import {
	executionGetByIdInputType,
	executionListInputType,
} from "../schema/execution";
import {
	getExecutionByIdService,
	listExecutionsService,
} from "../services/execution";
import { BadRequestError, InternalServerError } from "../lib/error";
import { logger } from "../lib/winston";

const getExecutionById = async (
	req: Request<executionGetByIdInputType["params"]>,
	res: Response,
) => {
	try {
		const execution = await getExecutionByIdService(req.params.id);
		if (!execution) throw new BadRequestError("Execution not found", 404);
		return res.status(200).json({ success: true, data: execution });
	} catch (error) {
		if (error instanceof BadRequestError) throw error;
		logger.error(`Error in getExecutionById: ${error}`);
		throw new InternalServerError();
	}
};

const listExecutions = async (req: Request, res: Response) => {
	try {
		const query = req.query as unknown as NonNullable<
			executionListInputType["query"]
		>;
		const { items, total, page, limit, totalPages } =
			await listExecutionsService({
				workflowId: query?.workflowId,
				status: query?.status,
				page: query?.page ?? 1,
				limit: query?.limit ?? 20,
			});
		return res.status(200).json({
			success: true,
			data: items,
			pagination: { total, page, limit, totalPages },
		});
	} catch (error) {
		logger.error(`Error in listExecutions: ${error}`);
		throw new InternalServerError();
	}
};

export { getExecutionById, listExecutions };
