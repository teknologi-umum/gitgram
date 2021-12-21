import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";

export const issueCommentCreated = 
  (ctx: Context): HandlerFunction<"issue_comment.created", unknown> => 
    async (event) => {
      //
    };

export const issueClosed = 
  (ctx: Context): HandlerFunction<"issues.closed", unknown> => 
    async (event) => {
      //
    };

export const issueOpened = 
  (ctx: Context): HandlerFunction<"issues.opened", unknown> => 
    async (event) => {
      //
    };
