import type {
  Execution,
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
  nodes?: Node[] | null;
  edges?: Edge[] | null;
  flow?: { status?: WorkflowStatus } | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const EXECUTIONS: Execution[] = [
  {
    id: "ex_1",
    workflowId: "wf_1",
    workflowName: "Customer onboarding",
    status: "success",
    startedAt: "2026-04-17T08:14:00Z",
    durationMs: 1240,
  },
  {
    id: "ex_2",
    workflowId: "wf_2",
    workflowName: "Slack issue notifier",
    status: "success",
    startedAt: "2026-04-17T09:01:00Z",
    durationMs: 530,
  },
  {
    id: "ex_3",
    workflowId: "wf_4",
    workflowName: "Sync HubSpot to Postgres",
    status: "failed",
    startedAt: "2026-04-17T07:50:00Z",
    durationMs: 8900,
  },
];

export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: "webhook",
    kind: "trigger",
    label: "Webhook",
    description: "Listen for HTTP requests",
    category: "Triggers",
  },
  {
    type: "schedule",
    kind: "trigger",
    label: "Schedule",
    description: "Run on a cron schedule",
    category: "Triggers",
  },
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
    status: w.flow?.status ?? "draft",
    updatedAt: w.updatedAt,
    nodeCount: w.nodes?.length ?? 0,
  };
}

function toDetail(w: BackendWorkflow): WorkflowDetail {
  return {
    id: w.id,
    name: w.name,
    status: w.flow?.status ?? "draft",
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
    nodes: detail.nodes,
    edges: detail.edges,
    flow: { status: detail.status },
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

export async function fetchExecutions(): Promise<Execution[]> {
  await delay(150);
  return EXECUTIONS;
}

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
