import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import { HOME_GROUP } from "env";
import type { Context } from "grammy";
import { Subject, throttleTime, asyncScheduler } from "rxjs";
import type { IReviewEvent } from "src/application/interfaces/events";
import { markdownToHTML } from "src/utils/markdown";
import templite from "templite";

export type ReviewTemplate = {
  submitted: {
    base: string;
    type: Record<string, string>;
  };
  edited: string;
  created: string;
};

export class ReviewEventHandler implements IReviewEvent {
  private readonly _prSubject$ = new Subject<[Context, string]>();

  constructor(private readonly _templates: ReviewTemplate) {
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

  submitted(ctx: Context): HandlerFunction<"pull_request_review.submitted", unknown> {
    return async (event) => {
      if (event.payload.review.body === null) {
        // don't do anything because Github sends this event with `null` body whenever
        // someone commented on a review.
        return;
      }

      const body = markdownToHTML(event.payload.review.body);
      const response = templite(
        this._templates.submitted.type[event.payload.review.state.toLowerCase()] + this._templates.submitted.base,
        {
          repoName: event.payload.repository.full_name,
          url: event.payload.pull_request.html_url,
          no: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          body: body,
          author: event.payload.pull_request.user.login,
          reviewUrl: event.payload.review.html_url,
          actor: event.payload.sender.login
        }
      );

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

  edited(ctx: Context): HandlerFunction<"pull_request_review.edited", unknown> {
    const template = `
    <b>🔮 PR review on <a href="{{url}}">#{{no}} {{title}}</a> was edited by {{actor}}</b>
    
    {{body}}
    
    <b>Assignee</b>: {{assignee}}
    <b>PR author</b>: {{author}}
    <b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;
    return (event) => {
      if (!event.payload.review.body) return;
      const body = markdownToHTML(event.payload.review.body);
      const response = templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.pull_request.html_url,
        no: event.payload.pull_request.number,
        title: event.payload.pull_request.title,
        body: body,
        author: event.payload.pull_request.user.login,
        reviewUrl: event.payload.review.html_url,
        actor: event.payload.sender.login
      });

      this._prSubject$.next([ctx, response]);
    };
  }

  created(ctx: Context): HandlerFunction<"pull_request_review_comment.created", unknown> {
    const template = `
    <b>💬 PR review comment on <a href="{{url}}">#{{no}} {{title}}</a> was created by {{actor}}</b>
    
    {{body}}
    
    <b>PR author</b>: {{author}}
    <b>See</b>: {{reviewUrl}}`;
    return async (event) => {
      const body = markdownToHTML(event.payload.comment.body);
      const response = templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.pull_request.html_url,
        no: event.payload.pull_request.number,
        title: event.payload.pull_request.title,
        body: body || "<i>No description provided.</i>",
        author: event.payload.pull_request.user.login,
        reviewUrl: event.payload.comment.url,
        actor: event.payload.sender.login
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
}
