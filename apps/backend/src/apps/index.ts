import { registerNode, type NodeHandler } from "../engine/registry";
import { httpRequest } from "./http";
import { ifBranch } from "./if";
import { outputCollect } from "./output";

const passthrough: NodeHandler = async (input) =>
	(input as Record<string, unknown>) ?? {};

const scheduleTrigger: NodeHandler<{ cron?: string; timezone?: string }> =
	async () => ({ firedAt: new Date().toISOString() });

registerNode("manual", passthrough);
registerNode("webhook", passthrough);
registerNode("schedule", scheduleTrigger);
registerNode("http", httpRequest);
registerNode("if", ifBranch);
registerNode("output", outputCollect);
