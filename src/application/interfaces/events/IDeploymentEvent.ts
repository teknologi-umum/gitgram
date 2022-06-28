import type { Context } from "grammy";
import type { HandlerFunction } from "~/application/webhook/types";

export interface IDeploymentEvent {
  status(ctx: Context): HandlerFunction<"deployment_status">;
}
