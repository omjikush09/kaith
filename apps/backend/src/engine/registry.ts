import { logger } from "../lib/winston";

export type NodeConfig = Record<string, unknown>;

export type NodeOutput = {
	branch?: string;
} & Record<string, unknown>;

export type NodeContext = {
	executionId: string;
	workflowId: string;
	nodeId: string;
	logger: typeof logger;
	trigger: unknown;
	nodes: Record<string, unknown>;
};

export type NodeHandler<
	TConfig extends NodeConfig = NodeConfig,
	TInput = unknown,
	TOutput extends NodeOutput | void = NodeOutput,
> = (
	input: TInput,
	config: TConfig,
	ctx: NodeContext,
) => Promise<TOutput>;

const handlers = new Map<string, NodeHandler>();

export const registerNode = <
	TConfig extends NodeConfig = NodeConfig,
	TInput = unknown,
	TOutput extends NodeOutput | void = NodeOutput,
>(
	type: string,
	handler: NodeHandler<TConfig, TInput, TOutput>,
) => {
	handlers.set(type, handler as unknown as NodeHandler);
};

export const getNodeHandler = (type: string): NodeHandler | undefined =>
	handlers.get(type);
