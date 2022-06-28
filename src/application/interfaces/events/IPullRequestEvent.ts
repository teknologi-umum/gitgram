import type { Context } from "grammy";
import type { HandlerFunction } from "~/application/webhook/types";

export interface IPullRequestEvent {
  closed(ctx: Context): HandlerFunction<"pull_request.closed">;
  opened(ctx: Context): HandlerFunction<"pull_request.opened">;
  edited(ctx: Context): HandlerFunction<"pull_request.edited">;
}
