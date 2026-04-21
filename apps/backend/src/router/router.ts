import { Router } from "express";
import workFlowRouter from "./workflow";
import executionRouter from "./execution";
import hookRouter from "./webhook";
import testRouter from "./test";

const router: Router = Router();

router.use("/workflow", workFlowRouter);
router.use("/execution", executionRouter);
router.use("/hook", hookRouter);
router.use("/test", testRouter);

export default router;
