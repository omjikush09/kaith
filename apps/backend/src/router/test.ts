import { Router, Request, Response } from "express";

const router: Router = Router();

const echo = (req: Request, res: Response) => {
	return res.status(200).json({
		success: true,
		data: {
			method: req.method,
			path: req.originalUrl,
			query: req.query,
			headers: req.headers,
			body: req.body ?? null,
			receivedAt: new Date().toISOString(),
		},
	});
};

router.all("/echo", echo);

router.get("/json", (_req, res) => {
	return res.status(200).json({
		success: true,
		data: {
			id: 1,
			name: "Kaith",
			tags: ["alpha", "beta"],
			now: new Date().toISOString(),
		},
	});
});

router.get("/status/:code", (req, res) => {
	const code = Number(req.params.code);
	const safe = Number.isFinite(code) && code >= 100 && code < 600 ? code : 200;
	return res.status(safe).json({ success: safe < 400, status: safe });
});

router.get("/delay/:ms", async (req, res) => {
	const ms = Math.min(Math.max(Number(req.params.ms) || 0, 0), 10_000);
	await new Promise((r) => setTimeout(r, ms));
	return res
		.status(200)
		.json({ success: true, data: { delayedMs: ms, at: new Date().toISOString() } });
});

export default router;
