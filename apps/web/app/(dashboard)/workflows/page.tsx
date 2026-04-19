"use client";

import Link from "next/link";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { MoreHorizontal, Search, Trash2, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { NewWorkflowButton } from "@/components/workflow/new-workflow-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { deleteWorkflow, fetchWorkflows } from "@/lib/api";
import type { WorkflowStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const statusBadge: Record<WorkflowStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  draft: "bg-muted text-muted-foreground",
  error: "bg-destructive/15 text-destructive",
};

const PAGE_SIZE = 12;

function getPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) out.push("ellipsis");
    out.push(sorted[i]!);
  }
  return out;
}

export default function WorkflowsPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["workflows", { page, search: debouncedQ }],
    queryFn: () =>
      fetchWorkflows({ page, limit: PAGE_SIZE, search: debouncedQ }),
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteWorkflow(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    },
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Build and manage your automations.
          </p>
        </div>
        <NewWorkflowButton />
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
        {!isLoading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">
            {debouncedQ
              ? "No workflows match your search."
              : "No workflows yet. Create one to get started."}
          </div>
        )}
        {items.map((w) => (
          <Card
            key={w.id}
            className="group h-full transition-colors hover:border-primary/40"
          >
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <Link
                href={`/workflows/${w.id}`}
                className="flex flex-1 items-center gap-2"
              >
                <Workflow className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">{w.name}</CardTitle>
              </Link>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("border-transparent", statusBadge[w.status])}
                >
                  {w.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Workflow actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (
                          confirm(`Delete "${w.name}"? This cannot be undone.`)
                        ) {
                          remove.mutate(w.id);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <Link href={`/workflows/${w.id}`}>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {w.nodeCount} nodes
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Last run:{" "}
                  {w.lastRun ? new Date(w.lastRun).toLocaleString() : "never"}
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
            </Link>
          </Card>
        ))}
      </div>

      {total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t px-8 py-4 sm:flex-row">
          <span className="text-xs text-muted-foreground">
            {rangeStart}–{rangeEnd} of {total}
          </span>
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={page <= 1 || isFetching}
                  className={cn(
                    (page <= 1 || isFetching) &&
                      "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1 && !isFetching) setPage(page - 1);
                  }}
                />
              </PaginationItem>
              {getPageList(page, totalPages).map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`e-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isFetching) setPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={page >= totalPages || isFetching}
                  className={cn(
                    (page >= totalPages || isFetching) &&
                      "pointer-events-none opacity-50",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages && !isFetching) setPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
