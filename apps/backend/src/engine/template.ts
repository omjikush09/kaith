import get from "lodash/get";

export type TemplateContext = Record<string, unknown>;

const FULL_EXPR = /^\s*\{\{\s*([\s\S]+?)\s*\}\}\s*$/; // full match - "{{ steps.A.output }}"
const TOKEN = /\{\{\s*([\s\S]+?)\s*\}\}/g; // partial match - "Hello {{ name }}!"

export const evaluateExpression = (
	expr: string,
	ctx: TemplateContext,
): unknown => get(ctx, expr.trim());

export const interpolateString = (
	input: string,
	ctx: TemplateContext,
): unknown => {
	const full = input.match(FULL_EXPR);
	if (full) return evaluateExpression(full[1]!, ctx);
	return input.replace(TOKEN, (_, expr) => {
		const v = evaluateExpression(expr, ctx);
		if (v == null) return "";
		return typeof v === "object" ? JSON.stringify(v) : String(v);
	});
};

export const interpolate = <T>(value: T, ctx: TemplateContext): T => {
	if (typeof value === "string") {
		return interpolateString(value, ctx) as T;
	}
	if (Array.isArray(value)) {
		return value.map((v) => interpolate(v, ctx)) as unknown as T;
	}
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value)) {
			out[k] = interpolate(v, ctx);
		}
		return out as T;
	}
	return value;
};
