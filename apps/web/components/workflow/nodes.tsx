"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NodeIcon, getNodeColor } from "./node-icons";
import { cn } from "@/lib/utils";
import type { WorkflowNodeData } from "@/lib/types";

function NodeShell({
  data,
  selected,
  withTarget,
  withSource,
}: {
  data: WorkflowNodeData;
  selected?: boolean;
  withTarget?: boolean;
  withSource?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex min-w-[200px] items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:border-muted-foreground/40",
      )}
    >
      {withTarget && (
        <Handle type="target" position={Position.Left} id="in" />
      )}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white",
          getNodeColor(data.kind),
        )}
      >
        <NodeIcon type={data.appType} className="h-4 w-4" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium leading-tight">
          {data.label}
        </span>
        <span className="truncate text-[11px] capitalize text-muted-foreground">
          {data.kind} · {data.appType}
        </span>
      </div>
      {withSource && (
        <Handle type="source" position={Position.Right} id="out" />
      )}
    </div>
  );
}

export function TriggerNode(props: NodeProps) {
  return (
    <NodeShell
      data={props.data as unknown as WorkflowNodeData}
      selected={props.selected}
      withSource
    />
  );
}

export function ActionNode(props: NodeProps) {
  return (
    <NodeShell
      data={props.data as unknown as WorkflowNodeData}
      selected={props.selected}
      withTarget
      withSource
    />
  );
}

export function ConditionNode(props: NodeProps) {
  return (
    <div className="relative">
      <NodeShell
        data={props.data as unknown as WorkflowNodeData}
        selected={props.selected}
        withTarget
      />
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: "30%", background: "#10b981" }}
      />
      <span className="pointer-events-none absolute -right-10 top-[22%] text-[10px] font-medium text-emerald-600">
        true
      </span>
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: "70%", background: "#ef4444" }}
      />
      <span className="pointer-events-none absolute -right-10 top-[62%] text-[10px] font-medium text-red-600">
        false
      </span>
    </div>
  );
}

export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};
