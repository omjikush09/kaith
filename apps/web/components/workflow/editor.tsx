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
  Loader2,
  Play,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchWorkflow, saveWorkflow } from "@/lib/api";
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
    const newNode: Node = {
      id,
      type: template.kind,
      position: {
        x: 200 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      },
      data: {
        label: template.label,
        kind: template.kind,
        appType: template.type,
        description: template.description,
      } satisfies WorkflowNodeData as unknown as Record<string, unknown>,
    };
    setNodes((ns) => [...ns, newNode]);
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

  const save = useMutation({
    mutationFn: () =>
      saveWorkflow({
        id: workflowId,
        name,
        status: active ? "active" : "draft",
        nodes,
        edges,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      qc.invalidateQueries({ queryKey: ["workflow", workflowId] });
    },
  });

  const stats = useMemo(
    () => ({
      nodes: nodes.length,
      edges: edges.length,
    }),
    [nodes, edges],
  );

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
          <Separator orientation="vertical" className="h-5" />
          <Button variant="outline" size="sm">
            <Play />
            Test run
          </Button>
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
