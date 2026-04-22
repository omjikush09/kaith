"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NodeConfigFormProps } from "./types";

export function WebhookConfig({ node, workflowId }: NodeConfigFormProps) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  const url = `${base}/api/hook/${workflowId}/${node.id}`;
  return (
    <div className="space-y-1.5">
      <Label>Webhook URL</Label>
      <Input
        readOnly
        value={url}
        className="font-mono text-xs"
        onFocus={(e) => e.currentTarget.select()}
      />
      <p className="text-xs text-muted-foreground">
        Send any HTTP method to this URL to trigger the workflow.
      </p>
    </div>
  );
}
