import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "grammy";

export interface IReviewEvent {
  submitted(ctx: Context): HandlerFunction<"pull_request_review.submitted", unknown>;
  edited(ctx: Context): HandlerFunction<"pull_request_review.edited", unknown>;
  created(ctx: Context): HandlerFunction<"pull_request_review_comment.created", unknown>;
}
