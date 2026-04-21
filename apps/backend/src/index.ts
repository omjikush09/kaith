import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { ENV } from "./env.js";
import { logger } from "./lib/winston.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import { CustomError } from "./lib/error.js";
import router from "./router/router.js";

const app = express();
app.use(
	cors({
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
	}),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(morgan("combined"));
app.use("/api", router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	logger.error(`Error in ${req.method} ${req.url} ${err.message}`);
	if (err instanceof CustomError) {
		return res.status(err.code).json({ message: err.message });
	}
	res.status(500).json({ message: "Internal Server Error" });
});

app.listen(ENV.PORT, () => {
	logger.info(`Server is running on port ${ENV.PORT}`);
});
