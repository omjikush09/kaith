import type { ComponentType } from "react";
import type { NodeConfigFormProps } from "./types";
// import { ScheduleConfig } from "./schedule";
import { WebhookConfig } from "./webhook";
import { HttpConfig } from "./http";
import { IfConfig } from "./if";
import { JsConfig } from "./js";

export const NODE_CONFIG_FORMS: Record<
  string,
  ComponentType<NodeConfigFormProps>
> = {
  // schedule: ScheduleConfig,
  webhook: WebhookConfig,
  http: HttpConfig,
  if: IfConfig,
  js: JsConfig,
};

export type { NodeConfigFormProps };
