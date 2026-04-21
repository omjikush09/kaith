import z from "zod";

const baseSchema = z.object({
	body: z.any(),
	query: z.any(),
	params: z.any(),
	headers: z.any(),
});

export { baseSchema };
