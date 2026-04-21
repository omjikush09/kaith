"use client";

import { useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { NodeConfigFormProps } from "./types";

type Mode =
  | "interval-min"
  | "interval-hour"
  | "daily"
  | "weekly"
  | "custom";

const DAYS = [
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
  { value: "0", label: "Sun" },
];

const localTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const pad = (n: number) => String(n).padStart(2, "0");

type Parsed = {
  mode: Mode;
  n: number;
  hour: number;
  minute: number;
  dow: string[];
};

const DEFAULT: Parsed = {
  mode: "daily",
  n: 5,
  hour: 9,
  minute: 0,
  dow: ["1"],
};

function parseCron(cron: string): Parsed {
  const c = cron.trim();
  let m: RegExpExecArray | null;
  if ((m = /^\*\/(\d+)\s+\*\s+\*\s+\*\s+\*$/.exec(c)))
    return { ...DEFAULT, mode: "interval-min", n: +m[1]! };
  if ((m = /^0\s+\*\/(\d+)\s+\*\s+\*\s+\*$/.exec(c)))
    return { ...DEFAULT, mode: "interval-hour", n: +m[1]! };
  if ((m = /^(\d+)\s+(\d+)\s+\*\s+\*\s+\*$/.exec(c)))
    return { ...DEFAULT, mode: "daily", minute: +m[1]!, hour: +m[2]! };
  if ((m = /^(\d+)\s+(\d+)\s+\*\s+\*\s+([\d,]+)$/.exec(c)))
    return {
      ...DEFAULT,
      mode: "weekly",
      minute: +m[1]!,
      hour: +m[2]!,
      dow: m[3]!.split(","),
    };
  return { ...DEFAULT, mode: "custom" };
}

function buildCron(p: Parsed): string {
  switch (p.mode) {
    case "interval-min":
      return `*/${Math.max(1, p.n)} * * * *`;
    case "interval-hour":
      return `0 */${Math.max(1, p.n)} * * *`;
    case "daily":
      return `${p.minute} ${p.hour} * * *`;
    case "weekly": {
      const days = p.dow.length ? [...p.dow].sort().join(",") : "1";
      return `${p.minute} ${p.hour} * * ${days}`;
    }
    default:
      return "";
  }
}

export function ScheduleConfig({ data, setConfig }: NodeConfigFormProps) {
  const cron = String(data.config?.cron ?? "");
  const timezone = String(data.config?.timezone ?? "");
  const storedMode =
    typeof data.config?.cronMode === "string"
      ? (data.config.cronMode as Mode)
      : undefined;

  const parsed = useMemo(() => {
    const p = parseCron(cron);
    return storedMode ? { ...p, mode: storedMode } : p;
  }, [cron, storedMode]);

  useEffect(() => {
    if (!timezone) setConfig({ timezone: localTimezone() });
  }, []);

  const update = (patch: Partial<Parsed>) => {
    const next = { ...parsed, ...patch };
    setConfig({ cron: buildCron(next), cronMode: next.mode });
  };

  const setMode = (mode: Mode) => {
    if (mode === "custom") {
      const customCron =
        typeof data.config?.customCron === "string"
          ? (data.config.customCron as string)
          : cron;
      setConfig({ cron: customCron, cronMode: "custom" });
      return;
    }
    setConfig({ cron: buildCron({ ...parsed, mode }), cronMode: mode });
  };

  const time = `${pad(parsed.hour)}:${pad(parsed.minute)}`;
  const onTimeChange = (v: string) => {
    const [h, m] = v.split(":").map(Number);
    update({ hour: h ?? 0, minute: m ?? 0 });
  };

  const toggleDay = (d: string) => {
    const set = new Set(parsed.dow);
    if (set.has(d)) set.delete(d);
    else set.add(d);
    update({ dow: [...set] });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="schedule-mode">Run</Label>
        <Select value={parsed.mode} onValueChange={(v) => setMode(v as Mode)}>
          <SelectTrigger id="schedule-mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interval-min">Every X minutes</SelectItem>
            <SelectItem value="interval-hour">Every X hours</SelectItem>
            <SelectItem value="daily">Daily at time</SelectItem>
            <SelectItem value="weekly">Weekly on days</SelectItem>
            <SelectItem value="custom">Custom cron</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(parsed.mode === "interval-min" || parsed.mode === "interval-hour") && (
        <div className="space-y-1.5">
          <Label htmlFor="schedule-n">
            Every {parsed.mode === "interval-min" ? "minutes" : "hours"}
          </Label>
          <Input
            id="schedule-n"
            type="number"
            min={1}
            value={parsed.n}
            onChange={(e) => update({ n: Math.max(1, Number(e.target.value)) })}
          />
        </div>
      )}

      {(parsed.mode === "daily" || parsed.mode === "weekly") && (
        <div className="space-y-1.5">
          <Label htmlFor="schedule-time">Time</Label>
          <Input
            id="schedule-time"
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
          />
        </div>
      )}

      {parsed.mode === "weekly" && (
        <div className="space-y-1.5">
          <Label>Days</Label>
          <div className="flex flex-wrap gap-1">
            {DAYS.map((d) => {
              const on = parsed.dow.includes(d.value);
              return (
                <Button
                  key={d.value}
                  type="button"
                  variant={on ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => toggleDay(d.value)}
                >
                  {d.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {parsed.mode === "custom" && (
        <div className="space-y-1.5">
          <Label htmlFor="cron">Cron expression</Label>
          <Input
            id="cron"
            value={cron}
            onChange={(e) =>
              setConfig({
                cron: e.target.value,
                customCron: e.target.value,
                cronMode: "custom",
              })
            }
            placeholder="*/5 * * * *"
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            5 fields: <code>min hour dom mon dow</code>.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="tz">Timezone</Label>
        <Input
          id="tz"
          value={timezone}
          onChange={(e) => setConfig({ timezone: e.target.value })}
          placeholder={localTimezone()}
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          IANA name, e.g. <code>{localTimezone()}</code>. Times are interpreted
          in this zone.
        </p>
      </div>

      <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs">
        <span className="text-muted-foreground">cron:&nbsp;</span>
        <code className="font-mono">{cron || "(not set)"}</code>
      </div>
    </div>
  );
}
