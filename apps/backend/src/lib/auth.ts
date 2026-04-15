import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { prisma } from "./prisma";

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
	},
    database:prismaAdapter(prisma,{
        provider:"postgresql",
        usePlural:true
    })
});
