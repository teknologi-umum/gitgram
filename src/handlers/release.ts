import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";
import templite from "templite";
import { markdownToHTML } from "../utils/markdown";

// start dulu, baru kirim event

export function release(
  ctx: Context
): HandlerFunction<"release.published", unknown> {
  return async (event) => {
    const template = `<b>🌱 New Release for <a href="https://github.com/{{repoName}}>{{repoName}}</a></b>

  {{body}}

  <b>Tag Name:</b> {{tag_name}}`;

    const response = templite(template, {
      tag_name: event.payload.release.tag_name,
      body: markdownToHTML(event.payload.release.body) || "<i>No description provided.</i>"
    });

    await ctx.telegram.sendMessage(
      ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
      response,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
  };
}
