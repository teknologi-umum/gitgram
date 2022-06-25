import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import { HOME_GROUP } from "env";
import type { Context } from "grammy";
import { Subject, throttleTime, asyncScheduler } from "rxjs";
import type { IPullRequestEvent } from "src/application/interfaces/events";
import { markdownToHTML } from "src/utils/markdown";
import { transformLabels } from "src/utils/transformLabels";
import templite from "templite";

export type PullRequestTemplate = {
  closed: {
    base: string;
    type: {
      merged: string;
      closed: string;
    };
  };
  opened: string;
  edited: string;
};

export class PullRequestEventHandler implements IPullRequestEvent {
  private readonly _prSubject$ = new Subject<[Context, string]>();

  constructor(private readonly _templates: PullRequestTemplate) {
    this._prSubject$
      .pipe(
        throttleTime(60 * 1000, asyncScheduler, {
          leading: true,
          trailing: true
        })
      )
      .subscribe({
        async next([ctx, response]) {
          await ctx.api.sendMessage(ctx.chat?.id ?? HOME_GROUP, response, {
            parse_mode: "HTML",
            disable_web_page_preview: true
          });
        }
      });
  }

  closed(ctx: Context): HandlerFunction<"pull_request.closed", unknown> {
    return async (event) => {
      let template = this._templates.closed.base;

      if (event.payload.pull_request.merged) {
        template = this._templates.closed.type.merged + this._templates.closed.base;
      } else {
        template = this._templates.closed.type.closed + this._templates.closed.base;
      }

      const body = markdownToHTML(event.payload.pull_request?.body ?? "");
      const response =
        templite(template, {
          url: event.payload.pull_request.html_url,
          no: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.pull_request.assignee?.login || "No Assignee",
          author: event.payload.pull_request.user.login,
          repoName: event.payload.repository.full_name,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.pull_request.labels);

      try {
        await ctx.api.sendMessage(ctx.chat?.id ?? HOME_GROUP, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true
        });
      } catch (err) {
        console.error(err);
      }
    };
  }

  opened(ctx: Context): HandlerFunction<"pull_request.opened", unknown> {
    const template = this._templates.opened;
    return async (event) => {
      const body = markdownToHTML(event.payload.pull_request?.body ?? "");
      const response =
        templite(template, {
          url: event.payload.pull_request.html_url,
          repoName: event.payload.repository.full_name,
          no: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.pull_request.assignee?.login || "No Assignee",
          author: event.payload.pull_request.user.login
        }) + transformLabels(event.payload.pull_request.labels);

      try {
        await ctx.api.sendMessage(ctx.chat?.id ?? HOME_GROUP, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true
        });
      } catch (e) {
        console.error(e);
      }
    };
  }

  edited(ctx: Context): HandlerFunction<"pull_request.edited", unknown> {
    return (event) => {
      const body = markdownToHTML(event.payload.pull_request?.body ?? "");
      const response =
        templite(this._templates.edited, {
          url: event.payload.pull_request.html_url,
          repoName: event.payload.repository.full_name,
          no: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.pull_request.assignee?.login || "No Assignee",
          author: event.payload.pull_request.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.pull_request.labels);

      this._prSubject$.next([ctx, response]);
    };
  }
}
