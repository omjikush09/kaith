import { Router } from "express";
import { validate } from "../middleware/validate";
import { createExecutionController } from "../controller/execution";
import { workflowCreateSchema } from "../schema/workflow";



const router:Router=Router()


router.post("/",validate(workflowCreateSchema),createExecutionController)



export default router;