import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "grammy";

export interface IIssueEvent {
  closed(ctx: Context): HandlerFunction<"issues.closed", unknown>;
  opened(ctx: Context): HandlerFunction<"issues.opened", unknown>;
  reopened(ctx: Context): HandlerFunction<"issues.reopened", unknown>;
  edited(ctx: Context): HandlerFunction<"issues.edited", unknown>;
  commentCreated(ctx: Context): HandlerFunction<"issue_comment.created", unknown>;
  commentEdited(ctx: Context): HandlerFunction<"issue_comment.edited", unknown>;
}
