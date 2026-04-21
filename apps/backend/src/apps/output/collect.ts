import type { NodeHandler, NodeOutput } from "../../engine/registry";

export type OutputConfig = Record<string, never>;

export type OutputCollect = NodeOutput & {
	trigger: unknown;
	input: unknown;
	nodes: Record<string, unknown>;
};

export const outputCollect: NodeHandler<
	OutputConfig,
	unknown,
	OutputCollect
> = async (input, _config, ctx) => {
	return {
		trigger: ctx.trigger,
		input,
		nodes: ctx.nodes,
	};
};
