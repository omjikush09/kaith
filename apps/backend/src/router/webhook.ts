import express, { Router } from "express";
import { triggerWebhook } from "../apps/trigger";

const router: Router = Router();

router.use(express.json({ limit: "5mb" }));
router.use(express.urlencoded({ extended: true, limit: "5mb" }));
router.use(express.text({ type: ["text/*", "application/xml"], limit: "5mb" }));
router.use(express.raw({ type: "application/octet-stream", limit: "5mb" }));

router.all("/:workflowId/:nodeId", triggerWebhook);

export default router;
