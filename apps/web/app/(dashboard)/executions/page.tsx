"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Filter,
  Hourglass,
  PlayCircle,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { fetchExecutions } from "@/lib/api";
import type { ExecutionStatus, ExecutionSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

function durationOf(e: ExecutionSummary) {
  if (!e.startedAt) return null;
  const end = e.finishedAt ? new Date(e.finishedAt).getTime() : Date.now();
  const ms = end - new Date(e.startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function ExecutionList({ items }: { items: ExecutionSummary[] }) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No executions to show.
      </div>
    );
  }
  return (
    <ul className="divide-y">
      {items.map((e) => {
        const Icon = icon[e.status];
        const dur = durationOf(e);
        return (
          <li
            key={e.id}
            className="flex items-center gap-4 px-6 py-3 hover:bg-accent/40"
          >
            <Icon className={cn("h-4 w-4", tone[e.status])} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/executions/${e.id}`}
                className="truncate text-sm font-medium hover:underline"
              >
                {e.name}
              </Link>
              <div className="text-xs text-muted-foreground">
                <span className="font-mono">{e.id.slice(0, 8)}</span> ·{" "}
                {new Date(e.startedAt ?? e.createdAt).toLocaleString()}
              </div>
            </div>
            {dur && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {dur}
              </div>
            )}
            <Badge
              variant="outline"
              className={cn("border-transparent", badge[e.status])}
            >
              {e.status}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

function ExecutionsView() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("workflowId") ?? undefined;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["executions", { workflowId }],
    queryFn: () => fetchExecutions({ page: 1, limit: 50, workflowId }),
  });

  const items = data?.items ?? [];
  const succeeded = items.filter((e) => e.status === "success");
  const failed = items.filter((e) => e.status === "failed");
  const running = items.filter(
    (e) => e.status === "running" || e.status === "pending",
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Executions</h1>
          <p className="text-sm text-muted-foreground">
            History of all workflow runs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {workflowId && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 pr-1 text-xs"
            >
              <Filter className="h-3 w-3" />
              workflow {workflowId.slice(0, 8)}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-5 w-5"
              >
                <Link href="/executions">
                  <X className="h-3 w-3" />
                </Link>
              </Button>
            </Badge>
          )}
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

      <div className="p-8">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="success">
              Succeeded ({succeeded.length})
            </TabsTrigger>
            <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
            <TabsTrigger value="running">
              Running ({running.length})
            </TabsTrigger>
          </TabsList>

          <Separator className="my-4" />

          <div className="rounded-lg border bg-card">
            {isLoading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading…</div>
            ) : (
              <>
                <TabsContent value="all" className="mt-0">
                  <ExecutionList items={items} />
                </TabsContent>
                <TabsContent value="success" className="mt-0">
                  <ExecutionList items={succeeded} />
                </TabsContent>
                <TabsContent value="failed" className="mt-0">
                  <ExecutionList items={failed} />
                </TabsContent>
                <TabsContent value="running" className="mt-0">
                  <ExecutionList items={running} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default function ExecutionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-muted-foreground">Loading…</div>
      }
    >
      <ExecutionsView />
    </Suspense>
  );
}
