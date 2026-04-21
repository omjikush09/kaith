"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type Node,
  type EdgeChange,
  type NodeChange,
  type OnSelectionChangeParams,
  ReactFlowProvider,
} from "@xyflow/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  History,
  Loader2,
  Play,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  fetchWorkflow,
  saveWorkflow,
  triggerManualExecution,
} from "@/lib/api";
import { toast } from "sonner";
import type { NodeTemplate, WorkflowNodeData } from "@/lib/types";
import { nodeTypes } from "./nodes";
import { NodePalette } from "./node-palette";
import { NodeConfig } from "./node-config";

let nodeCounter = 100;
const nextId = () => `n${++nodeCounter}`;

function EditorInner({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: () => fetchWorkflow(workflowId),
  });

  const [name, setName] = useState("");
  const [active, setActive] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!data) return;
    setName(data.name);
    setNodes(data.nodes);
    setEdges(data.edges);
    setActive(data.status === "active");
  }, [data]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((es) => applyEdgeChanges(changes, es)),
    [],
  );
  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((es) => addEdge({ ...c, animated: true }, es)),
    [],
  );

  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelectedNode(params.nodes[0] ?? null);
    },
    [],
  );

  const addNode = useCallback((template: NodeTemplate) => {
    const id = nextId();
    setNodes((ns) => {
      const taken = new Set(
        ns.map((n) => (n.data as unknown as WorkflowNodeData).label),
      );
      let label = template.label;
      let i = 2;
      while (taken.has(label)) label = `${template.label} ${i++}`;
      const newNode: Node = {
        id,
        type: template.kind,
        position: {
          x: 200 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        },
        data: {
          label,
          kind: template.kind,
          appType: template.type,
          description: template.description,
        } satisfies WorkflowNodeData as unknown as Record<string, unknown>,
      };
      return [...ns, newNode];
    });
  }, []);

  const updateNodeData = useCallback(
    (id: string, patch: Partial<WorkflowNodeData>) => {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      );
      setSelectedNode((s) =>
        s && s.id === id ? { ...s, data: { ...s.data, ...patch } } : s,
      );
    },
    [],
  );

  const deleteNode = useCallback((id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const duplicateName = useMemo(() => {
    const seen = new Map<string, number>();
    for (const n of nodes) {
      const label = (n.data as unknown as WorkflowNodeData).label?.trim() ?? "";
      if (!label) continue;
      seen.set(label, (seen.get(label) ?? 0) + 1);
    }
    for (const [label, count] of seen) if (count > 1) return label;
    return null;
  }, [nodes]);

  const save = useMutation({
    mutationFn: () => {
      if (duplicateName) {
        throw new Error(`Duplicate node name "${duplicateName}"`);
      }
      return saveWorkflow({
        id: workflowId,
        name,
        status: active ? "active" : "draft",
        nodes,
        edges,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      qc.invalidateQueries({ queryKey: ["workflow", workflowId] });
      toast.success("Workflow saved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    },
  });

  const stats = useMemo(
    () => ({
      nodes: nodes.length,
      edges: edges.length,
    }),
    [nodes, edges],
  );

  const manualNodes = useMemo(
    () =>
      nodes.filter(
        (n) => (n.data as unknown as WorkflowNodeData)?.appType === "manual",
      ),
    [nodes],
  );
  const hasManualTrigger = manualNodes.length > 0;

  const trigger = useMutation({
    mutationFn: () =>
      triggerManualExecution(workflowId, { nodeId: manualNodes[0]?.id }),
    onSuccess: (res) => {
      toast.success(`Execution queued (${res.executionId.slice(0, 8)}…)`);
      router.push(`/executions/${res.executionId}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to trigger");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/workflows")}>
          <ArrowLeft />
        </Button>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 max-w-xs border-transparent bg-transparent text-sm font-semibold focus-visible:border-input focus-visible:bg-background"
        />
        <Badge variant="outline" className="text-[11px]">
          {stats.nodes} nodes · {stats.edges} connections
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActive((a) => !a)}
            className={
              active ? "text-emerald-600" : "text-muted-foreground"
            }
          >
            {active ? <ToggleRight /> : <ToggleLeft />}
            {active ? "Active" : "Inactive"}
          </Button>
          {hasManualTrigger && (
            <>
              <Separator orientation="vertical" className="h-5" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => trigger.mutate()}
                disabled={trigger.isPending}
              >
                {trigger.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Play />
                )}
                {trigger.isPending ? "Triggering" : "Trigger"}
              </Button>
            </>
          )}
          <Separator orientation="vertical" className="h-5" />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/executions?workflowId=${workflowId}`}>
              <History />
              Executions
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button
            size="sm"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {save.isPending ? "Saving" : "Save"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <NodePalette onAdd={addNode} />
        <div className="relative flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            fitView
            proOptions={{ hideAttribution: false }}
          >
            <Background gap={16} size={1} />
            <Controls className="!shadow-none" />
            <MiniMap
              pannable
              zoomable
              className="!bg-card !border !rounded-md"
              nodeColor={(n) => {
                
                const data = n.data as unknown as WorkflowNodeData;
                switch (data?.kind) {
                  case "trigger":
                    return "#10b981";
                  case "condition":
                    return "#f59e0b";
                  default:
                    return "#0ea5e9";
                }
              }}
            />
          </ReactFlow>

          {nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg border border-dashed bg-card/80 px-6 py-4 text-center text-sm text-muted-foreground backdrop-blur">
                Click a node from the left panel to add it.
              </div>
            </div>
          )}
        </div>
      </div>

      <NodeConfig
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onChange={updateNodeData}
        onDelete={deleteNode}
        siblingNames={
          new Set(
            nodes
              .filter((n) => n.id !== selectedNode?.id)
              .map((n) => (n.data as unknown as WorkflowNodeData).label),
          )
        }
      />
    </div>
  );
}

export function WorkflowEditor({ workflowId }: { workflowId: string }) {
  return (
    <ReactFlowProvider>
      <EditorInner workflowId={workflowId} />
    </ReactFlowProvider>
  );
}
