import type { HandlerFunction } from "~/application/webhook/types";

export interface IPullRequestEvent {
  closed(): HandlerFunction<"pull_request.closed">;
  opened(): HandlerFunction<"pull_request.opened">;
  edited(): HandlerFunction<"pull_request.edited">;
}
