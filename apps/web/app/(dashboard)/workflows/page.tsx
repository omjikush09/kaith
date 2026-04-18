"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchWorkflows } from "@/lib/api";
import type { WorkflowStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

const statusBadge: Record<WorkflowStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  draft: "bg-muted text-muted-foreground",
  error: "bg-destructive/15 text-destructive",
};

export default function WorkflowsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: fetchWorkflows,
  });

  const filtered =
    data?.filter((w) => w.name.toLowerCase().includes(q.toLowerCase())) ?? [];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Build and manage your automations.
          </p>
        </div>
        <Button asChild>
          <Link href="/workflows/new">
            <Plus />
            New workflow
          </Link>
        </Button>
      </header>

      <div className="flex items-center gap-3 px-8 pt-6">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search workflows…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-8 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <div className="text-sm text-muted-foreground">Loading…</div>
        )}
        {filtered.map((w) => (
          <Link key={w.id} href={`/workflows/${w.id}`} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">{w.name}</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className={cn("border-transparent", statusBadge[w.status])}
                >
                  {w.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {w.nodeCount} nodes
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Last run:{" "}
                  {w.lastRun
                    ? new Date(w.lastRun).toLocaleString()
                    : "never"}
                </div>
                {typeof w.successRate === "number" && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-muted">
                      <div
                        className={cn(
                          "h-full rounded",
                          w.successRate > 0.8
                            ? "bg-emerald-500"
                            : w.successRate > 0.5
                              ? "bg-amber-500"
                              : "bg-destructive",
                        )}
                        style={{ width: `${w.successRate * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(w.successRate * 100)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
