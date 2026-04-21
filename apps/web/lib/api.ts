import type {
  ExecutionDetail,
  ExecutionStatus,
  ExecutionStep,
  ExecutionSummary,
  NodeTemplate,
  WorkflowStatus,
  WorkflowSummary,
} from "@/lib/types";
import type { Edge, Node } from "@xyflow/react";
import { http } from "@/lib/http";

type ApiEnvelope<T> = { success: boolean; message?: string; data: T };

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PaginatedEnvelope<T> = ApiEnvelope<T> & { pagination: Pagination };

export type PaginatedWorkflows = {
  items: WorkflowSummary[];
  pagination: Pagination;
};

type BackendWorkflow = {
  id: string;
  name: string;
  description?: string | null;
  status?: WorkflowStatus;
  nodes?: Node[] | null;
  edges?: Edge[] | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: "webhook",
    kind: "trigger",
    label: "Webhook",
    description: "Listen for HTTP requests",
    category: "Triggers",
  },
  // {
  //   type: "schedule",
  //   kind: "trigger",
  //   label: "Schedule",
  //   description: "Run on a cron schedule",
  //   category: "Triggers",
  // },
  {
    type: "manual",
    kind: "trigger",
    label: "Manual",
    description: "Trigger workflow manually",
    category: "Triggers",
  },
  {
    type: "http",
    kind: "action",
    label: "HTTP Request",
    description: "Make an HTTP request",
    category: "Actions",
  },
  {
    type: "slack",
    kind: "action",
    label: "Slack",
    description: "Send a Slack message",
    category: "Actions",
  },
  {
    type: "email",
    kind: "action",
    label: "Email",
    description: "Send an email",
    category: "Actions",
  },
  {
    type: "postgres",
    kind: "action",
    label: "Postgres",
    description: "Run a SQL query",
    category: "Actions",
  },
  {
    type: "if",
    kind: "condition",
    label: "If",
    description: "Branch on a condition",
    category: "Logic",
  },
  {
    type: "output",
    kind: "action",
    label: "Output",
    description: "Capture trigger, input and prior node outputs",
    category: "Debug",
  },
  {
    type: "switch",
    kind: "condition",
    label: "Switch",
    description: "Multi-branch routing",
    category: "Logic",
  },
];

export type WorkflowDetail = {
  id: string;
  name: string;
  status: WorkflowStatus;
  nodes: Node[];
  edges: Edge[];
};

function toSummary(w: BackendWorkflow): WorkflowSummary {
  return {
    id: w.id,
    name: w.name,
    status: w.status ?? "draft",
    updatedAt: w.updatedAt,
    nodeCount: w.nodes?.length ?? 0,
  };
}

function toDetail(w: BackendWorkflow): WorkflowDetail {
  return {
    id: w.id,
    name: w.name,
    status: w.status ?? "draft",
    nodes: w.nodes ?? [],
    edges: w.edges ?? [],
  };
}

export async function fetchWorkflows(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedWorkflows> {
  const { data } = await http.get<PaginatedEnvelope<BackendWorkflow[]>>(
    "/workflow",
    {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 12,
        ...(params?.search ? { search: params.search } : {}),
      },
    },
  );
  return {
    items: data.data.map(toSummary),
    pagination: data.pagination,
  };
}

export async function fetchWorkflow(id: string): Promise<WorkflowDetail> {
  const { data } = await http.get<ApiEnvelope<BackendWorkflow>>(
    `/workflow/${id}`,
  );
  return toDetail(data.data);
}

export async function saveWorkflow(detail: WorkflowDetail) {
  const payload = {
    name: detail.name,
    status: detail.status,
    nodes: detail.nodes,
    edges: detail.edges,
  };
  const { data } = await http.put<ApiEnvelope<BackendWorkflow>>(
    `/workflow/${detail.id}`,
    payload,
  );
  return toDetail(data.data);
}

export async function deleteWorkflow(id: string): Promise<void> {
  await http.delete(`/workflow/${id}`);
}

export async function triggerManualExecution(
  workflowId: string,
  options?: { nodeId?: string; payload?: unknown },
): Promise<{ executionId: string; status: string }> {
  const { data } = await http.post<
    ApiEnvelope<{ executionId: string; status: string }>
  >("/execution", {
    workflowId,
    ...(options?.nodeId ? { nodeId: options.nodeId } : {}),
    payload: options?.payload,
  });
  return data.data;
}

type BackendExecution = {
  id: string;
  name: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  error?: string | null;
  createdAt: string;
};

type BackendExecutionStep = {
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

type BackendExecutionDetail = BackendExecution & {
  steps: BackendExecutionStep[];
};

export type PaginatedExecutions = {
  items: ExecutionSummary[];
  pagination: Pagination;
};

export async function fetchExecutions(params?: {
  page?: number;
  limit?: number;
  workflowId?: string;
  status?: ExecutionStatus;
}): Promise<PaginatedExecutions> {
  const { data } = await http.get<PaginatedEnvelope<BackendExecution[]>>(
    "/execution",
    {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        ...(params?.workflowId ? { workflowId: params.workflowId } : {}),
        ...(params?.status ? { status: params.status } : {}),
      },
    },
  );
  return { items: data.data, pagination: data.pagination };
}

export async function fetchExecution(id: string): Promise<ExecutionDetail> {
  const { data } = await http.get<ApiEnvelope<BackendExecutionDetail>>(
    `/execution/${id}`,
  );
  return data.data as ExecutionDetail;
}

export type { ExecutionStep };

export type CreateWorkflowInput = {
  name: string;
  description?: string;
  userId: string;
  nodes?: Node[];
  edges?: Edge[];
  flow?: unknown;
};

export type CreatedWorkflow = {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  nodes: Node[];
  edges: Edge[];
};

export async function createWorkflow(
  input: CreateWorkflowInput,
): Promise<CreatedWorkflow> {
  const payload = {
    name: input.name,
    description: input.description ?? "",
    nodes: input.nodes ?? [],
    edges: input.edges ?? [],
    flow: input.flow ?? {},
    userId: input.userId,
  };
  const { data } = await http.post<ApiEnvelope<CreatedWorkflow>>(
    "/workflow",
    payload,
  );
  return data.data;
}
