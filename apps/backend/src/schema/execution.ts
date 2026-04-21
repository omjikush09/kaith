import z from "zod";
import { baseSchema } from "./base";

const executionStartSchema = baseSchema.extend({
	body: z.object({
		workflowId: z.string().min(1),
		nodeId: z.string().min(1).optional(),
		payload: z.any().optional(),
	}),
});

const executionGetByIdSchema = baseSchema.extend({
	params: z.object({ id: z.string().min(1) }),
});

const executionListSchema = baseSchema.extend({
	query: z
		.object({
			workflowId: z.string().optional(),
			status: z.string().optional(),
			page: z.coerce.number().int().min(1).optional().default(1),
			limit: z.coerce.number().int().min(1).max(100).optional().default(20),
		})
		.optional(),
});

type executionStartInputType = z.infer<typeof executionStartSchema>;
type executionGetByIdInputType = z.infer<typeof executionGetByIdSchema>;
type executionListInputType = z.infer<typeof executionListSchema>;

export {
	executionStartSchema,
	executionGetByIdSchema,
	executionListSchema,
	executionStartInputType,
	executionGetByIdInputType,
	executionListInputType,
};
