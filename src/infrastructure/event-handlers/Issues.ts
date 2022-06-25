import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import { HOME_GROUP } from "env";
import type { Context } from "grammy";
import { asyncScheduler, Subject, throttleTime } from "rxjs";
import type { IIssueEvent } from "src/application/interfaces/events";
import { markdownToHTML } from "src/utils/markdown";
import { transformLabels } from "src/utils/transformLabels";
import templite from "templite";

export type IssueTemplate = {
  closed: string;
  opened: string;
  reopened: string;
  edited: string;
  commentCreated: string;
  commentEdited: string;
};

export class IssuesEventHandler implements IIssueEvent {
  private readonly _issueSubject$ = new Subject<[Context, string]>();

  constructor(private readonly _templates: IssueTemplate) {
    this._issueSubject$
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

  closed(ctx: Context): HandlerFunction<"issues.closed", unknown> {
    return async (event) => {
      const response =
        templite(this._templates.closed, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.issue.labels);

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

  opened(ctx: Context): HandlerFunction<"issues.opened", unknown> {
    return async (event) => {
      const body = markdownToHTML(event.payload.issue?.body ?? "");
      const response =
        templite(this._templates.opened, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login
        }) + transformLabels(event.payload.issue.labels);

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

  reopened(ctx: Context): HandlerFunction<"issues.reopened", unknown> {
    return async (event) => {
      const response =
        templite(this._templates.reopened, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.issue.labels);

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

  edited(ctx: Context): HandlerFunction<"issues.edited", unknown> {
    return (event) => {
      const response =
        templite(this._templates.edited, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.issue.labels);

      this._issueSubject$.next([ctx, response]);
    };
  }

  commentCreated(ctx: Context): HandlerFunction<"issue_comment.created", unknown> {
    return async (event) => {
      const isPR = event.payload.issue.pull_request?.url;
      const body = markdownToHTML(event.payload.comment.body);
      const response = templite(this._templates.commentCreated, {
        repoName: event.payload.repository.full_name,
        url: event.payload.comment.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        body: body || "<i>Comment was empty.</i>",
        author: event.payload.issue.user.login,
        actor: event.payload.comment.user.login,
        where: isPR ? "PR" : "Issue"
      });

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

  commentEdited(ctx: Context): HandlerFunction<"issue_comment.edited", unknown> {
    return (event) => {
      const body = markdownToHTML(event.payload.issue?.body ?? "");
      const response =
        templite(this._templates.commentEdited, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.issue.labels);

      this._issueSubject$.next([ctx, response]);
    };
  }
}
