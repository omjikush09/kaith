import z, { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { InternalServerError } from "../lib/error";

const validate = (schema: z.ZodType) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const parsed = schema.parse({
				body: req.body,
				query: req.query,
				params: req.params,
				headers: req.headers,
			}) as {
				body?: unknown;
				query?: unknown;
				params?: unknown;
			};
			if (parsed.body !== undefined) req.body = parsed.body;
			if (parsed.params !== undefined) {
				req.params = parsed.params as typeof req.params;
			}
			if (parsed.query !== undefined) {
				// This is due to exprerss query have only getter and no setter
				Object.defineProperty(req, "query", {
					value: parsed.query,
					writable: true,
					configurable: true,
				});
			}
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).json({ message: z.prettifyError(error) });
			}
			throw new InternalServerError();
		}
	};
};

export { validate };
