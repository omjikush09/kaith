import type {
  Execution,
  NodeTemplate,
  WorkflowSummary,
} from "@/lib/types";
import type { Edge, Node } from "@xyflow/react";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const WORKFLOWS: WorkflowSummary[] = [
  {
    id: "wf_1",
    name: "Customer onboarding",
    status: "active",
    updatedAt: "2026-04-15T10:32:00Z",
    nodeCount: 6,
    lastRun: "2026-04-17T08:14:00Z",
    successRate: 0.98,
  },
  {
    id: "wf_2",
    name: "Slack issue notifier",
    status: "active",
    updatedAt: "2026-04-12T18:11:00Z",
    nodeCount: 4,
    lastRun: "2026-04-17T09:01:00Z",
    successRate: 0.92,
  },
  {
    id: "wf_3",
    name: "Daily report digest",
    status: "draft",
    updatedAt: "2026-04-10T07:42:00Z",
    nodeCount: 3,
  },
  {
    id: "wf_4",
    name: "Sync HubSpot to Postgres",
    status: "error",
    updatedAt: "2026-04-09T22:09:00Z",
    nodeCount: 5,
    lastRun: "2026-04-17T07:50:00Z",
    successRate: 0.41,
  },
];

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
  {
    id: "ex_4",
    workflowId: "wf_1",
    workflowName: "Customer onboarding",
    status: "running",
    startedAt: "2026-04-17T10:00:00Z",
    durationMs: 0,
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
  status: WorkflowSummary["status"];
  nodes: Node[];
  edges: Edge[];
};

const WORKFLOW_DETAILS: Record<string, WorkflowDetail> = {
  wf_1: {
    id: "wf_1",
    name: "Customer onboarding",
    status: "active",
    nodes: [
      {
        id: "n1",
        type: "trigger",
        position: { x: 80, y: 120 },
        data: {
          label: "Webhook",
          kind: "trigger",
          appType: "webhook",
          description: "POST /onboard",
        },
      },
      {
        id: "n2",
        type: "action",
        position: { x: 380, y: 120 },
        data: {
          label: "Create user",
          kind: "action",
          appType: "postgres",
          description: "INSERT INTO users",
        },
      },
      {
        id: "n3",
        type: "action",
        position: { x: 680, y: 60 },
        data: {
          label: "Send welcome email",
          kind: "action",
          appType: "email",
        },
      },
      {
        id: "n4",
        type: "action",
        position: { x: 680, y: 200 },
        data: {
          label: "Notify team",
          kind: "action",
          appType: "slack",
        },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", animated: true },
      { id: "e2", source: "n2", target: "n3" },
      { id: "e3", source: "n2", target: "n4" },
    ],
  },
  wf_2: {
    id: "wf_2",
    name: "Slack issue notifier",
    status: "active",
    nodes: [
      {
        id: "n1",
        type: "trigger",
        position: { x: 80, y: 120 },
        data: { label: "Schedule", kind: "trigger", appType: "schedule" },
      },
      {
        id: "n2",
        type: "action",
        position: { x: 380, y: 120 },
        data: { label: "Fetch issues", kind: "action", appType: "http" },
      },
      {
        id: "n3",
        type: "action",
        position: { x: 680, y: 120 },
        data: { label: "Post to Slack", kind: "action", appType: "slack" },
      },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2", animated: true },
      { id: "e2", source: "n2", target: "n3" },
    ],
  },
};

export async function fetchWorkflows(): Promise<WorkflowSummary[]> {
  await delay(150);
  return WORKFLOWS;
}

export async function fetchExecutions(): Promise<Execution[]> {
  await delay(150);
  return EXECUTIONS;
}

export async function fetchWorkflow(id: string): Promise<WorkflowDetail> {
  await delay(150);
  return (
    WORKFLOW_DETAILS[id] ?? {
      id,
      name: "Untitled workflow",
      status: "draft",
      nodes: [
        {
          id: "n1",
          type: "trigger",
          position: { x: 200, y: 200 },
          data: { label: "Manual", kind: "trigger", appType: "manual" },
        },
      ],
      edges: [],
    }
  );
}

export async function saveWorkflow(detail: WorkflowDetail) {
  await delay(250);
  WORKFLOW_DETAILS[detail.id] = detail;
  return detail;
}
