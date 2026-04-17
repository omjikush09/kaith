import z, { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { InternalServerError } from "../lib/error";

const validate = (schema: z.ZodType) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse({
				body: req.body,
				query: req.query,
				params: req.params,
				headers: req.headers,
			});
			next();
    		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).json({ message: z.prettifyError(error) });
			}
			throw new InternalServerError();
		}
	};
};


export {validate}