import { Router } from "express";
import { validate } from "../middleware/validate";
import {
	workflowCreateSchema,
	workflowDeleteSchema,
	workflowGetByIdSchema,
	workflowListSchema,
	workflowUpdateSchema,
} from "../schema/workflow";
import {
	createWorkFlow,
	deleteWorkFlow,
	getWorkFlowById,
	listWorkFlows,
	updateWorkFlow,
} from "../controller/workflow";

const router: Router = Router();

router.get("/", validate(workflowListSchema), listWorkFlows);
router.post("/", validate(workflowCreateSchema), createWorkFlow);
router.get("/:id", validate(workflowGetByIdSchema), getWorkFlowById);
router.put("/:id", validate(workflowUpdateSchema), updateWorkFlow);
router.delete("/:id", validate(workflowDeleteSchema), deleteWorkFlow);

export default router;
