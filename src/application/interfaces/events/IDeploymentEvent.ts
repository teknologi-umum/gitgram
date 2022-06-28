import type { HandlerFunction } from "~/application/webhook/types";

export interface IDeploymentEvent {
  status(): HandlerFunction<"deployment_status">;
}
