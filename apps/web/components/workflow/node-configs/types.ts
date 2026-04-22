import type { Node } from "@xyflow/react";
import type { WorkflowNodeData } from "@/lib/types";

export type NodeConfigFormProps = {
  node: Node;
  data: WorkflowNodeData;
  workflowId: string;
  setConfig: (patch: Record<string, unknown>) => void;
};
