"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { WorkflowNodeData } from "@/lib/types";

type Props = {
  node: Node | null;
  onClose: () => void;
  onChange: (id: string, data: Partial<WorkflowNodeData>) => void;
  onDelete: (id: string) => void;
};

export function NodeConfig({ node, onClose, onChange, onDelete }: Props) {
  const data = node?.data as unknown as WorkflowNodeData | undefined;

  return (
    <Sheet open={!!node} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-[380px] flex-col gap-0 p-0 sm:max-w-[380px]">
        {node && data && (
          <>
            <SheetHeader className="border-b p-5">
              <SheetTitle className="text-base">Configure node</SheetTitle>
              <SheetDescription className="text-xs capitalize">
                {data.kind} · {data.appType}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="space-y-1.5">
                <Label htmlFor="label">Name</Label>
                <Input
                  id="label"
                  value={data.label}
                  onChange={(e) =>
                    onChange(node.id, { label: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  rows={3}
                  value={data.description ?? ""}
                  onChange={(e) =>
                    onChange(node.id, { description: e.target.value })
                  }
                  placeholder="What does this node do?"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Node ID</Label>
                <Input value={node.id} readOnly className="font-mono text-xs" />
              </div>
            </div>

            <div className="flex items-center justify-between border-t p-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  onDelete(node.id);
                  onClose();
                }}
              >
                <Trash2 />
                Delete
              </Button>
              <Button size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
