import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";
import templite from "templite";
import { remark } from "remark";
import html from "remark-html"

// start dulu, baru kirim event

export const release = (ctx: Context): HandlerFunction<"release.published", unknown> => async (event) => {
  let template = `<b>🌱 New Release !!!</b>

  {{body}}

  <b>Tag Name:</b> {{tag_name}}`;

  const test =  await remark()
  .use(html).process(event.payload.release.body)

  console.log(test)

  const response = templite(template, {
    tag_name: event.payload.release.tag_name,
    body: test || "<i>No description provided.</i>"
  })

  await ctx.telegram.sendMessage(
    ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
      response,
    { parse_mode: "HTML", disable_web_page_preview: true }
  )
};
