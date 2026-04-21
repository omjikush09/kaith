import {
  Webhook,
  Clock,
  MousePointerClick,
  Globe,
  GitBranch,
  Inspect,
  Box,
  Code2,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  webhook: Webhook,
  schedule: Clock,
  manual: MousePointerClick,
  http: Globe,
  if: GitBranch,
  js: Code2,
  output: Inspect,
};

export function NodeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const Icon = ICONS[type] ?? Box;
  return <Icon className={className} />;
}

export function getNodeColor(kind: "trigger" | "action" | "condition") {
  switch (kind) {
    case "trigger":
      return "bg-emerald-500";
    case "action":
      return "bg-sky-500";
    case "condition":
      return "bg-amber-500";
  }
}
