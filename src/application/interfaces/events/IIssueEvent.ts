import type { HandlerFunction } from "~/application/webhook/types";

export interface IIssueEvent {
  closed(): HandlerFunction<"issue.closed">;
  opened(): HandlerFunction<"issue.opened">;
  reopened(): HandlerFunction<"issue.reopened">;
  edited(): HandlerFunction<"issue.edited">;
  commentCreated(): HandlerFunction<"issue_comment.created">;
  commentEdited(): HandlerFunction<"issue_comment.edited">;
}
