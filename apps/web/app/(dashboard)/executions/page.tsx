"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  RefreshCw,
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
import type { Execution, ExecutionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

const tone: Record<ExecutionStatus, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  failed: "text-destructive",
  running: "text-amber-600 dark:text-amber-400",
};

const icon: Record<
  ExecutionStatus,
  React.ComponentType<{ className?: string }>
> = {
  success: CheckCircle2,
  failed: XCircle,
  running: PlayCircle,
};

const badge: Record<ExecutionStatus, string> = {
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  failed: "bg-destructive/15 text-destructive",
  running: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

function formatDuration(ms: number) {
  if (ms === 0) return "running";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function ExecutionList({ items }: { items: Execution[] }) {
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
        return (
          <li
            key={e.id}
            className="flex items-center gap-4 px-6 py-3 hover:bg-accent/40"
          >
            <Icon className={cn("h-4 w-4", tone[e.status])} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/workflows/${e.workflowId}`}
                className="truncate text-sm font-medium hover:underline"
              >
                {e.workflowName}
              </Link>
              <div className="text-xs text-muted-foreground">
                <span className="font-mono">{e.id}</span> ·{" "}
                {new Date(e.startedAt).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDuration(e.durationMs)}
            </div>
            <Badge variant="outline" className={cn("border-transparent", badge[e.status])}>
              {e.status}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}

export default function ExecutionsPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["executions"],
    queryFn: fetchExecutions,
  });

  const items = data ?? [];
  const succeeded = items.filter((e) => e.status === "success");
  const failed = items.filter((e) => e.status === "failed");
  const running = items.filter((e) => e.status === "running");

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Executions</h1>
          <p className="text-sm text-muted-foreground">
            History of all workflow runs.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn(isFetching && "animate-spin")} />
          Refresh
        </Button>
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
