"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";

function SignUpForm() {
	const router = useRouter();
	const params = useSearchParams();
	const next = params.get("next") ?? "/overview";

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setPending(true);
		try {
			const { error } = await signUp.email({ name, email, password });
			setPending(false);
			if (error) {
				toast.error(error.message ?? "Sign-up failed");
				setError(error.message ?? "Sign-up failed");
				return;
			}
			toast.success("Account created");
		} catch (err) {
			setPending(false);
			toast.error(err instanceof Error ? err.message : "Something went wrong");
			return;
		}
		router.push(next);
		router.refresh();
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="space-y-1.5">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					autoComplete="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					autoComplete="new-password"
					required
					minLength={8}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>
			{error && <p className="text-xs text-destructive">{error}</p>}
			<Button type="submit" className="w-full" disabled={pending}>
				{pending && <Loader2 className="animate-spin" />}
				Create account
			</Button>
		</form>
	);
}

export default function SignUpPage() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Create account</CardTitle>
				<CardDescription>Start automating in a minute.</CardDescription>
			</CardHeader>
			<CardContent>
				<Suspense fallback={<div className="h-60" />}>
					<SignUpForm />
				</Suspense>
				<p className="mt-4 text-center text-xs text-muted-foreground">
					Already have one?{" "}
					<Link href="/sign-in" className="text-foreground underline">
						Sign in
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
