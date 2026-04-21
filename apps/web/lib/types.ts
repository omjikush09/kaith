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

export type ExecutionStatus = "pending" | "running" | "success" | "failed";

export type ExecutionSummary = {
  id: string;
  name: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  error?: string | null;
  createdAt: string;
};

export type ExecutionStep = {
  id: string;
  index: number;
  nodeId: string;
  type: string;
  status: ExecutionStatus;
  metadata?: { label?: string | null } | null;
  input: unknown;
  output: unknown;
  error?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
};

export type ExecutionDetail = ExecutionSummary & {
  steps: ExecutionStep[];
};

export type NodeTemplate = {
  type: string;
  kind: NodeKind;
  label: string;
  description: string;
  category: string;
};
