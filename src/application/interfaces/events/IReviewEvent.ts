import type { HandlerFunction } from "~/application/webhook/types";

export interface IReviewEvent {
  submitted(): HandlerFunction<"pull_request_review.submitted">;
  edited(): HandlerFunction<"pull_request_review.edited">;
  created(): HandlerFunction<"pull_request_review_comment.created">;
}
