import type { NodeHandler, NodeOutput } from "../../engine/registry";

export type IfOp = "eq" | "neq" | "gt" | "lt";

export type IfConfig = {
	leftKey?: string;
	op?: IfOp;
	right?: unknown;
};

export type IfOutput = NodeOutput & {
	branch: "true" | "false";
	value: unknown;
};

export const ifBranch: NodeHandler<IfConfig, unknown, IfOutput> = async (
	input,
	config,
) => {
	const left = (input as Record<string, unknown> | null)?.[
		config.leftKey ?? "value"
	];
	const right = config.right;
	const op = config.op ?? "eq";

	const ops: Record<IfOp, () => boolean> = {
		eq: () => left === right,
		neq: () => left !== right,
		gt: () => Number(left) > Number(right),
		lt: () => Number(left) < Number(right),
	};

	const truthy = ops[op]?.() ?? Boolean(left);

	return { branch: truthy ? "true" : "false", value: left };
};
