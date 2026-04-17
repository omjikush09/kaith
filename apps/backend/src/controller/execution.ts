import { Request, Response } from "express";
import { createWorkflowService } from "../services/workflow";
import { logger } from "../lib/winston";
import { InternalServerError } from "../lib/error";

const createExecutionController = (req: Request, res: Response) => {
	try {
        throw new Error()
		const workflowData = req.body;
		return createWorkflowService(workflowData);
	} catch (error) {
		logger.error(`Error in createExecutionController: ${error}`);
		throw new InternalServerError();
	}
};

export { createExecutionController };
