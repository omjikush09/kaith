import express from "express";
import { ENV } from "./env.js";
import { logger } from "./lib/winston.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";

const app = express();
app.use(
	cors({
		origin: "*",
		credentials: true,
	}),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.listen(ENV.PORT, () => {
	logger.info(`Server is running on port ${ENV.PORT}`);
});
