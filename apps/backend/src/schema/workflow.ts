import z from "zod";
import { baseSchema } from "./base";

const workflow = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	flow: z.any(),
	userId: z.string(),
});

type workflowType = z.infer<typeof workflow>;

const workflowCreateSchema = baseSchema.extend({
	body: workflow,
});

type workFlowCreateInputType = z.infer<typeof workflowCreateSchema>;

export { workflowCreateSchema, workFlowCreateInputType, workflowType };
