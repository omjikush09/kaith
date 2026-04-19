import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { prisma } from "./prisma";

const WEB_URL = process.env.WEB_URL ?? "http://localhost:3000";

export const auth = betterAuth({
	baseURL: process.env.BACKEND_URL ?? "http://localhost:8080",
	trustedOrigins: [WEB_URL],
	emailAndPassword: {
		enabled: true,
	},
	database: prismaAdapter(prisma, {
		provider: "postgresql",
		usePlural: true,
	}),
});
