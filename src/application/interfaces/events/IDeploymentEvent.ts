import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "grammy";

export interface IDeploymentEvent {
  status(ctx: Context): HandlerFunction<"deployment_status", unknown>;
}
