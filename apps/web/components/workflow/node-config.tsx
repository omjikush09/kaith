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
import { NODE_CONFIG_FORMS } from "./node-configs";

type Props = {
  node: Node | null;
  workflowId: string;
  onClose: () => void;
  onChange: (id: string, data: Partial<WorkflowNodeData>) => void;
  onDelete: (id: string) => void;
  siblingNames?: Set<string>;
};

export function NodeConfig({
  node,
  workflowId,
  onClose,
  onChange,
  onDelete,
  siblingNames,
}: Props) {
  const data = node?.data as unknown as WorkflowNodeData | undefined;
  const labelTrimmed = data?.label?.trim() ?? "";
  const nameError = !labelTrimmed
    ? "Name is required"
    : siblingNames?.has(data!.label)
      ? "Name must be unique"
      : null;

  const setConfig = (patch: Record<string, unknown>) => {
    if (!node || !data) return;
    onChange(node.id, {
      config: { ...(data.config ?? {}), ...patch },
    });
  };

  const Form = data ? NODE_CONFIG_FORMS[data.appType] : undefined;

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
                  aria-invalid={!!nameError}
                  className={
                    nameError ? "border-destructive" : undefined
                  }
                />
                {nameError ? (
                  <p className="text-xs text-destructive">{nameError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Reference in templates as{" "}
                    <code className="font-mono">
                      {`{{ $nodes['${data.label}'].body }}`}
                    </code>
                  </p>
                )}
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

              {Form && (
                <Form
                  node={node}
                  data={data}
                  workflowId={workflowId}
                  setConfig={setConfig}
                />
              )}

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
