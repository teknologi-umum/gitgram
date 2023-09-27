import type { HandlerFunction } from "~/application/webhook/types";

export interface IReleaseEvent {
  published(): HandlerFunction<"release.published">;
}