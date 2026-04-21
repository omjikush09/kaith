"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NodeConfigFormProps } from "./types";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];

export function HttpConfig({ data, setConfig }: NodeConfigFormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="http-method">Method</Label>
        <Select
          value={String(data.config?.method ?? "GET")}
          onValueChange={(v) => setConfig({ method: v })}
        >
          <SelectTrigger id="http-method" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="http-url">URL</Label>
        <Input
          id="http-url"
          value={String(data.config?.url ?? "")}
          onChange={(e) => setConfig({ url: e.target.value })}
          placeholder="https://api.example.com/path"
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Use <code>{"{{ $input.field }}"}</code> to interpolate from the
          previous node.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="http-headers">Headers (JSON)</Label>
        <Textarea
          id="http-headers"
          rows={3}
          value={
            typeof data.config?.headers === "string"
              ? data.config.headers
              : data.config?.headers
                ? JSON.stringify(data.config.headers, null, 2)
                : ""
          }
          onChange={(e) => setConfig({ headers: e.target.value })}
          placeholder='{"Content-Type": "application/json"}'
          className="font-mono text-xs"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="http-body">Body</Label>
        <Textarea
          id="http-body"
          rows={4}
          value={String(data.config?.body ?? "")}
          onChange={(e) => setConfig({ body: e.target.value })}
          placeholder='{"key": "value"}'
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
