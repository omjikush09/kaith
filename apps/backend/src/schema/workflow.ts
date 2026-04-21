import z from "zod";
import { baseSchema } from "./base";

const workflowStatus = z.enum(["active", "draft", "error"]);

const workflow = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	status: workflowStatus.optional().default("draft"),
	nodes: z.array(z.any()).optional().default([]),
	edges: z.array(z.any()).optional().default([]),
	flow: z.any().optional().default({}),
	userId: z.string(),
});

const workflowUpdate = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	status: workflowStatus.optional(),
	nodes: z.array(z.any()).optional(),
	edges: z.array(z.any()).optional(),
	flow: z.any().optional(),
});

type workflowType = z.infer<typeof workflow>;

const workflowCreateSchema = baseSchema.extend({
	body: workflow,
});

const workflowGetByIdSchema = baseSchema.extend({
	params: z.object({ id: z.string().min(1) }),
});

const workflowListSchema = baseSchema.extend({
	query: z
		.object({
			userId: z.string().optional(),
			search: z.string().optional(),
			page: z.coerce.number().int().min(1).optional().default(1),
			limit: z.coerce.number().int().min(1).max(100).optional().default(20),
		})
		.optional(),
});

const workflowUpdateSchema = baseSchema.extend({
	params: z.object({ id: z.string().min(1) }),
	body: workflowUpdate,
});

const workflowDeleteSchema = baseSchema.extend({
	params: z.object({ id: z.string().min(1) }),
});

type workFlowCreateInputType = z.infer<typeof workflowCreateSchema>;
type workFlowUpdateInputType = z.infer<typeof workflowUpdateSchema>;
type workFlowGetByIdInputType = z.infer<typeof workflowGetByIdSchema>;
type workFlowListInputType = z.infer<typeof workflowListSchema>;
type workFlowDeleteInputType = z.infer<typeof workflowDeleteSchema>;

export {
	workflowCreateSchema,
	workflowGetByIdSchema,
	workflowListSchema,
	workflowUpdateSchema,
	workflowDeleteSchema,
	workFlowCreateInputType,
	workFlowUpdateInputType,
	workFlowGetByIdInputType,
	workFlowListInputType,
	workFlowDeleteInputType,
	workflowType,
};
