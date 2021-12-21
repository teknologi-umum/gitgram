import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";
import templite from "templite";

export const prClosed =
  (ctx: Context): HandlerFunction<"pull_request.closed", unknown> =>
    async (event) => {
      let template: string;
      if (event.payload.pull_request.merged) {
        template = "<b>Pull request was merged: #{{no}} {{title}}</b>\n\n{{body}}\n\nBy {{author}}\nSee: {{url}}";
      } else {
        template = "<b>Pull request was closed with unmerged commits: #{{no}} {{title}}</b>\n\n{{body}}\n\nBy {{author}}\nSee: {{url}}";
      }

      const response = templite(
        template,
        {
          no: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          body: event.payload.pull_request.body,
          author: event.payload.pull_request.user.name,
          url: event.payload.pull_request.url
        }
      );

      await ctx.telegram.sendMessage(
        ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
        response,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    };

export const prOpened =
  (ctx: Context): HandlerFunction<"pull_request.opened", unknown> =>
    async (event) => {
      let template = "<b>Pull request opened: #{{no}} {{title}}</b>\n\n{{body}}\n\nBy {{author}}\nSee: {{url}}";
      if (event.payload.pull_request.labels.length > 0) {
        template += "\nTags: {{labels}}";
      }
      const response = templite(
        template,
        {
          no: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          author: event.payload.pull_request.user.name,
          body: event.payload.pull_request.body,
          url: event.payload.pull_request.url,
          labels: event.payload.pull_request.labels.map(o => o.name).join(", ")
        }
      );

      await ctx.telegram.sendMessage(
        ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
        response,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    };

export const prReviewSubmitted =
  (ctx: Context): HandlerFunction<"pull_request_review.submitted", unknown> =>
    async (event) => {
      //
    };

export const prReviewComment =
  (ctx: Context): HandlerFunction<"pull_request_review_comment.created", unknown> =>
    async (event) => {
      //
    };
