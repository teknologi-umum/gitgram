import type { HandlerFunction } from "~/application/webhook/types";

export interface IDiscussionEvent {
  created(): HandlerFunction<"discussion.created">;
  closed(): HandlerFunction<"discussion.closed">;
  reopened(): HandlerFunction<"discussion.reopened">;
  edited(): HandlerFunction<"discussion.edited">;
  deleted(): HandlerFunction<"discussion.deleted">;
  pinned(): HandlerFunction<"discussion.pinned">;
  answered(): HandlerFunction<"discussion.answered">;
  commentCreated(): HandlerFunction<"discussion_comment.created">;
}