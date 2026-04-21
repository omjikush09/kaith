import type { NodeHandler, NodeOutput } from "../../engine/registry";

export type HttpMethod =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "DELETE"
	| "HEAD";

export type HttpConfig = {
	url: string;
	method?: HttpMethod;
	headers?: string | Record<string, string>;
	body?: string | Record<string, unknown> | unknown[];
};

export type HttpOutput = NodeOutput & {
	status: number;
	body: unknown;
};

const parseHeaders = (raw: HttpConfig["headers"]): Record<string, string> => {
	if (!raw) return {};
	if (typeof raw === "object") return raw as Record<string, string>;
	const trimmed = raw.trim();
	if (!trimmed) return {};
	try {
		const parsed = JSON.parse(trimmed);
		return parsed && typeof parsed === "object"
			? (parsed as Record<string, string>)
			: {};
	} catch {
		throw new Error("http node: headers must be valid JSON");
	}
};

const looksLikeJson = (s: string) => {
	const t = s.trim();
	return t.startsWith("{") || t.startsWith("[");
};

export const httpRequest: NodeHandler<HttpConfig, unknown, HttpOutput> = async (
	_input,
	config,
) => {
	const url = String(config.url ?? "");
	const method = (config.method ?? "GET").toUpperCase() as HttpMethod;
	if (!url) throw new Error("http node requires config.url");

	const headers = parseHeaders(config.headers);

	let body: BodyInit | undefined;
	if (method !== "GET" && method !== "HEAD") {
		const hasCT = Object.keys(headers).some(
			(k) => k.toLowerCase() === "content-type",
		);
		if (typeof config.body === "string") {
			body = config.body;
			if (!hasCT && looksLikeJson(config.body)) {
				headers["Content-Type"] = "application/json";
			}
		} else if (config.body != null) {
			body = JSON.stringify(config.body);
			if (!hasCT) headers["Content-Type"] = "application/json";
		}
	}

	const res = await fetch(url, {
		method,
		headers: Object.keys(headers).length ? headers : undefined,
		body,
	});

	const text = await res.text();
	const parsed = (() => {
		try {
			return JSON.parse(text);
		} catch {
			return text;
		}
	})();

	if (!res.ok) {
		const detail =
			typeof parsed === "string" ? parsed : JSON.stringify(parsed);
		throw new Error(`HTTP ${res.status} ${res.statusText}: ${detail}`);
	}

	return { status: res.status, body: parsed };
};
