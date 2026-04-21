"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Hourglass,
  PlayCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchExecution } from "@/lib/api";
import type { ExecutionStatus, ExecutionStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const tone: Record<ExecutionStatus, string> = {
  pending: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  failed: "text-destructive",
  running: "text-amber-600 dark:text-amber-400",
};

const icon: Record<
  ExecutionStatus,
  React.ComponentType<{ className?: string }>
> = {
  pending: Hourglass,
  success: CheckCircle2,
  failed: XCircle,
  running: PlayCircle,
};

const badge: Record<ExecutionStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  failed: "bg-destructive/15 text-destructive",
  running: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

function fmt(ts?: string | null) {
  return ts ? new Date(ts).toLocaleString() : "—";
}

function durationMs(start?: string | null, end?: string | null) {
  if (!start) return null;
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  return e - s;
}

function fmtDuration(ms: number | null) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function JsonBlock({ value }: { value: unknown }) {
  let body: string;
  try {
    body = JSON.stringify(value, null, 2);
  } catch {
    body = String(value);
  }
  if (body === undefined || body === "null" || body === "{}" || body === "")
    body = body || "—";
  return (
    <pre className="max-h-72 overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed">
      {body}
    </pre>
  );
}

function StepCard({ step }: { step: ExecutionStep }) {
  const Icon = icon[step.status];
  const dur = durationMs(step.startedAt, step.finishedAt);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <span className="grid h-6 w-6 place-items-center rounded-full border text-[11px] font-medium text-muted-foreground">
            {step.index + 1}
          </span>
          <Icon className={cn("h-4 w-4", tone[step.status])} />
          <div>
            <CardTitle className="text-sm">
              {step.metadata?.label || step.type}
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                {step.nodeId}
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              {step.type} · {fmt(step.startedAt)} · {fmtDuration(dur)}
            </CardDescription>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("border-transparent", badge[step.status])}
        >
          {step.status}
        </Badge>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3 pt-4">
        {step.error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            {step.error}
          </div>
        )}
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              Input
            </div>
            <JsonBlock value={step.input} />
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              Output
            </div>
            <JsonBlock value={step.output} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["execution", id],
    queryFn: () => fetchExecution(id),
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "pending" || s === "running" ? 2000 : false;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Loading…</div>
    );
  }
  if (!data) {
    return <div className="p-8 text-sm text-muted-foreground">Not found.</div>;
  }

  const Icon = icon[data.status];
  const dur = durationMs(data.startedAt, data.finishedAt);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex items-center gap-3 border-b px-6 py-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/executions">
            <ArrowLeft />
          </Link>
        </Button>
        <Icon className={cn("h-5 w-5", tone[data.status])} />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {data.name}
          </h1>
          <div className="text-xs text-muted-foreground">
            <Link
              href={`/workflows/${data.workflowId}`}
              className="hover:underline"
            >
              workflow {data.workflowId.slice(0, 8)}
            </Link>{" "}
            · execution <span className="font-mono">{data.id}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("border-transparent", badge[data.status])}
          >
            {data.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn(isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

      <section className="grid gap-3 border-b bg-muted/20 px-6 py-4 sm:grid-cols-4">
        <Stat label="Started" value={fmt(data.startedAt)} />
        <Stat label="Finished" value={fmt(data.finishedAt)} />
        <Stat
          label="Duration"
          value={fmtDuration(dur)}
          icon={<Clock className="h-3 w-3" />}
        />
        <Stat label="Steps" value={String(data.steps.length)} />
      </section>

      {data.error && (
        <div className="mx-6 mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {data.error}
        </div>
      )}

      <div className="space-y-4 p-6">
        {data.steps.length === 0 ? (
          <div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
            No steps recorded yet.
          </div>
        ) : (
          data.steps.map((s) => <StepCard key={s.id} step={s} />)
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center gap-1 text-sm font-medium">
        {icon}
        {value}
      </div>
    </div>
  );
}
