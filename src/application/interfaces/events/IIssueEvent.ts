import type { HandlerFunction } from "~/application/webhook/types";

export interface IIssueEvent {
  closed(): HandlerFunction<"issues.closed">;
  opened(): HandlerFunction<"issues.opened">;
  reopened(): HandlerFunction<"issues.reopened">;
  edited(): HandlerFunction<"issues.edited">;
  commentCreated(): HandlerFunction<"issue_comment.created">;
  commentEdited(): HandlerFunction<"issue_comment.edited">;
}