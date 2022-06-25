import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import { HOME_GROUP } from "env";
import type { Context } from "grammy";
import type { IReleaseEvent } from "src/application/interfaces/events";
import { markdownToHTML } from "src/utils/markdown";
import templite from "templite";

export class ReleaseEventHandler implements IReleaseEvent {
  published(ctx: Context): HandlerFunction<"release.published", unknown> {
    return async (event) => {
      const template = `<b>🌱 New Release <a href="{{url}}">{{name}}</a> by {{actor}}</b>
  
  {{body}}
  
  <b>Tag</b>: {{tag_name}}
  <b>Repo</b>: <a href="https://github.com/{{repoName}}>{{repoName}}</a>`;

      const body = markdownToHTML(event.payload.release.body);
      const response = templite(template, {
        tag_name: event.payload.release.tag_name,
        repoName: event.payload.repository.full_name,
        name: event.payload.release.name,
        url: event.payload.release.url,
        body: body || "<i>No description provided.</i>",
        actor: event.payload.sender.login
      });

      await ctx.api.sendMessage(ctx.chat?.id ?? HOME_GROUP, response, {
        parse_mode: "HTML",
        disable_web_page_preview: true
      });
    };
  }
}
