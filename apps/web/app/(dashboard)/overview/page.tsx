"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  PlayCircle,
  Plus,
  Workflow,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchExecutions, fetchWorkflows } from "@/lib/api";
import type { ExecutionStatus, WorkflowStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusBadge: Record<WorkflowStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  draft: "bg-muted text-muted-foreground",
  error: "bg-destructive/15 text-destructive",
};

const execIcon: Record<ExecutionStatus, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  failed: XCircle,
  running: PlayCircle,
};

const execTone: Record<ExecutionStatus, string> = {
  success: "text-emerald-500",
  failed: "text-destructive",
  running: "text-amber-500",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function OverviewPage() {
  const workflows = useQuery({
    queryKey: ["workflows"],
    queryFn: fetchWorkflows,
  });
  const executions = useQuery({
    queryKey: ["executions"],
    queryFn: fetchExecutions,
  });

  const total = workflows.data?.length ?? 0;
  const active = workflows.data?.filter((w) => w.status === "active").length ?? 0;
  const failedRuns =
    executions.data?.filter((e) => e.status === "failed").length ?? 0;
  const runs24h = executions.data?.length ?? 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            What's happening across your workspace.
          </p>
        </div>
        <Button asChild>
          <Link href="/workflows/new">
            <Plus />
            New workflow
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 p-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Workflows"
          value={total}
          hint={`${active} active`}
          icon={Workflow}
        />
        <StatCard
          label="Runs (24h)"
          value={runs24h}
          hint="last day"
          icon={PlayCircle}
        />
        <StatCard
          label="Failed runs"
          value={failedRuns}
          hint="needs attention"
          icon={XCircle}
          tone="destructive"
        />
        <StatCard
          label="Avg duration"
          value="1.4s"
          hint="across active flows"
          icon={Clock}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 px-8 pb-10 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Workflows</CardTitle>
              <CardDescription>Your most recently updated flows.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/workflows">
                View all
                <ArrowUpRight />
              </Link>
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {workflows.isLoading && (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            )}
            <ul className="divide-y">
              {workflows.data?.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-4 px-6 py-3 hover:bg-accent/50"
                >
                  <Link
                    href={`/workflows/${w.id}`}
                    className="flex flex-1 items-center gap-3"
                  >
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {w.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {w.nodeCount} nodes · updated {timeAgo(w.updatedAt)}
                      </div>
                    </div>
                  </Link>
                  <Badge
                    variant="outline"
                    className={cn("border-transparent", statusBadge[w.status])}
                  >
                    {w.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent executions</CardTitle>
            <CardDescription>Latest workflow runs.</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul className="divide-y">
              {executions.data?.map((e) => {
                const Icon = execIcon[e.status];
                return (
                  <li key={e.id} className="flex items-center gap-3 px-6 py-3">
                    <Icon className={cn("h-4 w-4", execTone[e.status])} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {e.workflowName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {timeAgo(e.startedAt)} ·{" "}
                        {e.status === "running"
                          ? "running"
                          : `${(e.durationMs / 1000).toFixed(1)}s`}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "destructive";
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <Icon
          className={cn(
            "h-4 w-4 text-muted-foreground",
            tone === "destructive" && "text-destructive",
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}
