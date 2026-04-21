"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NodeConfigFormProps } from "./types";

export function IfConfig({ data, setConfig }: NodeConfigFormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="if-left">Left key</Label>
        <Input
          id="if-left"
          value={String(data.config?.leftKey ?? "")}
          onChange={(e) => setConfig({ leftKey: e.target.value })}
          placeholder="value"
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Field name on the previous node&apos;s output.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="if-op">Operator</Label>
        <Select
          value={String(data.config?.op ?? "eq")}
          onValueChange={(v) => setConfig({ op: v })}
        >
          <SelectTrigger id="if-op" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="eq">equals (=)</SelectItem>
            <SelectItem value="neq">not equals (≠)</SelectItem>
            <SelectItem value="gt">greater than (&gt;)</SelectItem>
            <SelectItem value="lt">less than (&lt;)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="if-right">Right value</Label>
        <Input
          id="if-right"
          value={String(data.config?.right ?? "")}
          onChange={(e) => setConfig({ right: e.target.value })}
          placeholder="expected value"
          className="font-mono text-xs"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Outputs <code>branch: &quot;true&quot;</code> or
        <code> &quot;false&quot;</code>; wire edges from the matching handle.
      </p>
    </div>
  );
}
