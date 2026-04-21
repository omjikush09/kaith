"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NodeConfigFormProps } from "./types";

export function WebhookConfig({ node }: NodeConfigFormProps) {
  return (
    <div className="space-y-1.5">
      <Label>Webhook URL</Label>
      <Input
        readOnly
        value={`${process.env.NEXT_PUBLIC_BACKEND_URL ?? ""}/api/hook/${node.id}`}
        className="font-mono text-xs"
        onFocus={(e) => e.currentTarget.select()}
      />
      <p className="text-xs text-muted-foreground">
        Save the workflow first; the URL becomes
        <code> /api/hook/{`{workflowId}`}/{node.id}</code>.
      </p>
    </div>
  );
}
