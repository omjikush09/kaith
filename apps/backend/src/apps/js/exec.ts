import vm from "node:vm";
import type { NodeHandler, NodeOutput } from "../../engine/registry";

export type JsConfig = {
	code?: string;
};

export type JsOutput = NodeOutput & {
	value: unknown;
};

const TIMEOUT_MS = 5000;

export const jsExec: NodeHandler<JsConfig, unknown, JsOutput> = async (
	input,
	config,
	ctx,
) => {
	const code = String(config.code ?? "").trim();
	if (!code) throw new Error("js node requires config.code");

	const wrapped = `(async ($input, $trigger, $nodes) => {\n${code}\n})($input, $trigger, $nodes)`;

	const sandbox: Record<string, unknown> = {
		$input: input,
		$trigger: ctx.trigger,
		$nodes: ctx.nodes,
		console,
	};
	const context = vm.createContext(sandbox);
	const script = new vm.Script(wrapped, {
		filename: `js-node-${ctx.nodeId}`,
	});

	const timeout = new Promise<never>((_, reject) =>
		setTimeout(
			() => reject(new Error(`js node timed out after ${TIMEOUT_MS}ms`)),
			TIMEOUT_MS,
		),
	);

	const value = await Promise.race([script.runInContext(context), timeout]);
	return { value: value ?? null };
};
