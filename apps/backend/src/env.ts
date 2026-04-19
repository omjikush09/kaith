import z from "zod";
import dotenv from "dotenv";

dotenv.config();

const env_schema = {
	PORT: process.env.PORT || 8080,
};

const schema = z.object({
	PORT: z.coerce.number().default(8080),
});

const ENV = schema.parse(env_schema);
export { ENV };
