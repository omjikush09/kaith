import { Router } from "express";
import workFlowRouter from "./workflow";
import executionRouter from "./execution";
import webhookRouter from "./webhook";
import testRouter from "./test";

const router: Router = Router();

router.use("/workflow", workFlowRouter);
router.use("/execution", executionRouter);
router.use("/webhook", webhookRouter);
router.use("/test", testRouter);

export default router;
