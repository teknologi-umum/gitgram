import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "grammy";
import templite from "templite";
import { HOME_GROUP } from "~/env";
import type { IReleaseEvent } from "~/application/interfaces/events";
import { markdownToHTML } from "~/utils/markdown";

export type ReleaseTemplate = {
  published: string;
};

export class ReleaseEventHandler implements IReleaseEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: ReleaseTemplate) {}

  published(ctx: Context): HandlerFunction<"release.published", unknown> {
    return async (event) => {
      const body = markdownToHTML(event.payload.release.body);
      const response = templite(this._templates.published, {
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
