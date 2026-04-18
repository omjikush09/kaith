"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { NODE_TEMPLATES } from "@/lib/api";
import { NodeIcon, getNodeColor } from "./node-icons";
import { cn } from "@/lib/utils";
import type { NodeTemplate } from "@/lib/types";

export function NodePalette({
  onAdd,
}: {
  onAdd: (template: NodeTemplate) => void;
}) {
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const filtered = NODE_TEMPLATES.filter((t) =>
      `${t.label} ${t.description}`.toLowerCase().includes(q.toLowerCase()),
    );
    return filtered.reduce<Record<string, NodeTemplate[]>>((acc, t) => {
      (acc[t.category] ??= []).push(t);
      return acc;
    }, {});
  }, [q]);

  return (
    <div className="flex h-full w-72 flex-col border-r bg-card">
      <div className="border-b p-3">
        <div className="text-sm font-semibold">Nodes</div>
        <div className="text-xs text-muted-foreground">
          Click to add to canvas
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search nodes…"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {category}
              </div>
              <div className="space-y-1">
                {items.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => onAdd(t)}
                    className="flex w-full items-center gap-3 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-accent"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white",
                        getNodeColor(t.kind),
                      )}
                    >
                      <NodeIcon type={t.type} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {t.label}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {t.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
