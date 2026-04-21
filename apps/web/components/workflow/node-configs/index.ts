import type { ComponentType } from "react";
import type { NodeConfigFormProps } from "./types";
// import { ScheduleConfig } from "./schedule";
import { WebhookConfig } from "./webhook";
import { HttpConfig } from "./http";
import { IfConfig } from "./if";

export const NODE_CONFIG_FORMS: Record<
  string,
  ComponentType<NodeConfigFormProps>
> = {
  // schedule: ScheduleConfig,
  webhook: WebhookConfig,
  http: HttpConfig,
  if: IfConfig,
};

export type { NodeConfigFormProps };
