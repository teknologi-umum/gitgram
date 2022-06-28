import type { Context } from "grammy";
import type { HandlerFunction } from "~/application/webhook/types";

export interface IIssueEvent {
  closed(ctx: Context): HandlerFunction<"issue.closed">;
  opened(ctx: Context): HandlerFunction<"issue.opened">;
  reopened(ctx: Context): HandlerFunction<"issue.reopened">;
  edited(ctx: Context): HandlerFunction<"issue.edited">;
  commentCreated(ctx: Context): HandlerFunction<"issue_comment.created">;
  commentEdited(ctx: Context): HandlerFunction<"issue_comment.edited">;
}
