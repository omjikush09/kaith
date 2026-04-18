export type NodeKind = "trigger" | "action" | "condition";

export type WorkflowStatus = "active" | "draft" | "error";

export type WorkflowNodeData = {
  label: string;
  kind: NodeKind;
  appType: string;
  description?: string;
  config?: Record<string, unknown>;
};

export type WorkflowSummary = {
  id: string;
  name: string;
  status: WorkflowStatus;
  updatedAt: string;
  nodeCount: number;
  lastRun?: string;
  successRate?: number;
};

export type ExecutionStatus = "success" | "failed" | "running";

export type Execution = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startedAt: string;
  durationMs: number;
};

export type NodeTemplate = {
  type: string;
  kind: NodeKind;
  label: string;
  description: string;
  category: string;
};
