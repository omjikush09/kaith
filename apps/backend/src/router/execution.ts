import { Router } from "express";
import { validate } from "../middleware/validate";
import {
	executionGetByIdSchema,
	executionListSchema,
	executionStartSchema,
} from "../schema/execution";
import { getExecutionById, listExecutions } from "../controller/execution";
import { triggerManual } from "../apps/trigger";

const router: Router = Router();

router.get("/", validate(executionListSchema), listExecutions);
router.post("/", validate(executionStartSchema), triggerManual);
router.get("/:id", validate(executionGetByIdSchema), getExecutionById);

export default router;
