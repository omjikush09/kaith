"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NodeConfigFormProps } from "./types";

const PLACEHOLDER = `// Available: $input, $trigger, $nodes
// Return the value you want to emit.
return { doubled: ($input?.value ?? 0) * 2 };`;

export function JsConfig({ data, setConfig }: NodeConfigFormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="js-code">Code</Label>
        <Textarea
          id="js-code"
          rows={10}
          value={String(data.config?.code ?? "")}
          onChange={(e) => setConfig({ code: e.target.value })}
          placeholder={PLACEHOLDER}
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Runs in a sandboxed VM with a 5s timeout. Use <code>return</code> to
          emit a value; it will be available as <code>$input</code> on the next
          node.
        </p>
      </div>
    </div>
  );
}
