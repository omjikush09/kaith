"use client";

import Link from "next/link";
import { ArrowRight, Boxes, Workflow, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const signedIn = Boolean(session);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Boxes className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold">Kaith</span>
        </Link>
        <div className="flex items-center gap-2">
          {isPending ? null : signedIn ? (
            <Button asChild>
              <Link href="/overview">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Workflow automation, built for builders.
          </h1>
          <p className="mt-6 text-base text-muted-foreground md:text-lg">
            Design, run, and monitor workflows visually. Connect HTTP calls,
            schedules, and conditions without leaving your browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={signedIn ? "/overview" : "/sign-up"}>
                {signedIn ? "Open dashboard" : "Get started"}
                <ArrowRight />
              </Link>
            </Button>
            {!signedIn && (
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">I already have an account</Link>
              </Button>
            )}
          </div>
        </div>
      </main>

      <section className="border-t bg-muted/30 px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
          <Feature
            icon={Workflow}
            title="Visual workflows"
            body="Drag nodes, draw edges, and ship automations in minutes."
          />
          <Feature
            icon={Zap}
            title="Triggers that matter"
            body="Cron, webhooks, and manual runs — all from one canvas."
          />
          <Feature
            icon={Boxes}
            title="Integrate anything"
            body="Call any HTTP API or chain conditions together."
          />
        </div>
      </section>

      <footer className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kaith
      </footer>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
