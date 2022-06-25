import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "grammy";

export interface IPullRequestEvent {
  closed(ctx: Context): HandlerFunction<"pull_request.closed", unknown>;
  opened(ctx: Context): HandlerFunction<"pull_request.opened", unknown>;
  edited(ctx: Context): HandlerFunction<"pull_request.edited", unknown>;
}
