import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import { HOME_GROUP } from "env";
import type { Context } from "grammy";
import { Subject, throttleTime, asyncScheduler } from "rxjs";
import type { IPullRequestEvent } from "src/application/interfaces/events";
import { markdownToHTML } from "src/utils/markdown";
import { transformLabels } from "src/utils/transformLabels";
import templite from "templite";

export class PullRequestEventHandler implements IPullRequestEvent {
  private readonly _prSubject$ = new Subject<[Context, string]>();

  constructor() {
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
      let template = `
  {{body}}
  
  <b>Assignee</b>: {{assignee}}
  <b>PR author</b>: {{author}}
  <b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;

      if (event.payload.pull_request.merged) {
        template = '<b>🎉 PR <a href="{{url}}">#{{no}} {{title}}</a> was merged by {{actor}}</b>' + template;
      } else {
        template =
          '<b>🚫 PR <a href="{{url}}">#{{no}} {{title}}</a> was closed with unmerged commits by {{actor}}</b>' +
          template;
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
    const template = `
    <b>🔮 New PR <a href="{{url}}">#{{no}} {{title}}</a> by {{author}}</b>
    
    {{body}}
    
    <b>Assignee</b>: {{assignee}}
    <b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;
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
    const template = `
<b>🔮 PR <a href="{{url}}">#{{no}} {{title}}</a> was edited by {{actor}}</b>
<b></b>

{{body}}

<b>Assignee</b>: {{assignee}}
<b>PR author</b>: {{author}}
<b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;

    return (event) => {
      const body = markdownToHTML(event.payload.pull_request?.body ?? "");
      const response =
        templite(template, {
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
