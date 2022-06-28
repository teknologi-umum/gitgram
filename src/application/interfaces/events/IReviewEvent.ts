import type { Context } from "grammy";
import type { HandlerFunction } from "~/application/webhook/types";

export interface IReviewEvent {
  submitted(ctx: Context): HandlerFunction<"pull_request_review.submitted">;
  edited(ctx: Context): HandlerFunction<"pull_request_review.edited">;
  created(ctx: Context): HandlerFunction<"pull_request_review_comment.created">;
}
