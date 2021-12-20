import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";

export const prClosed = 
  (ctx: Context): HandlerFunction<"pull_request.closed", unknown> => 
  (event) => {
  //
}

export const prOpened = 
  (ctx: Context): HandlerFunction<"pull_request.opened", unknown> => 
  (event) => {
  //
}

export const prReviewSubmitted = 
  (ctx: Context): HandlerFunction<"pull_request_review.submitted", unknown> => 
  (event) => {
  //
}

export const prReviewComment = 
  (ctx: Context): HandlerFunction<"pull_request_review_comment.created", unknown> => 
  (event) => {
  //
}


