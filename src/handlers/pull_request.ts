import { Subject, throttleTime, asyncScheduler } from "rxjs";
import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";
import templite from "templite";
import { transformLabels } from "../utils/transformLabels";
import { markdownToHTML } from "../utils/markdown";

const prSubject$ = new Subject<[Context, string]>();

prSubject$
  .pipe(
    throttleTime(60 * 1000, asyncScheduler, {
      leading: true,
      trailing: true
    })
  )
  .subscribe({
    async next([ctx, response]) {
      await ctx.telegram.sendMessage(
        ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
        response,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    }
  });

export function prClosed(
  ctx: Context
): HandlerFunction<"pull_request.closed", unknown> {
  return async (event) => {
    let template = `
{{body}}

<b>Assignee</b>: {{assignee}}
<b>PR author</b>: {{author}}
<b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;

    if (event.payload.pull_request.merged) {
      template =
        "<b>🎉 PR <a href=\"{{url}}\">#{{no}} {{title}}</a> was merged by {{actor}}</b>" + template;
    } else {
      template =
        "<b>🚫 PR <a href=\"{{url}}\">#{{no}} {{title}}</a> was closed with unmerged commits by {{actor}}</b>" + template;
    }

    const body = markdownToHTML(event.payload.pull_request?.body ?? "");
    const response =
      templite(template, {
        url: event.payload.pull_request.html_url,
        no: event.payload.pull_request.number,
        title: event.payload.pull_request.title,
        body:
          (body.length > 100 ? body.slice(0, 100) + "..." : body) ||
          "<i>No description provided.</i>",
        assignee: event.payload.pull_request.assignee?.login ?? "No Assignee",
        author: event.payload.pull_request.user.login,
        repoName: event.payload.repository.name,
        actor: event.payload.sender.login
      }) + transformLabels(event.payload.pull_request.labels);

    try {
      await ctx.telegram.sendMessage(
        ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
        response,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    } catch (err) {
      console.error(err);
    }
  };
}

export function prOpened(
  ctx: Context
): HandlerFunction<"pull_request.opened", unknown> {
  const template = `
<b>🔮 New PR <a href="{{url}}">#{{no}} {{title}}</a> by {{author}}</b>
<b></b>

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
        body:
          (body.length > 100 ? body.slice(0, 100) + "..." : body) ||
          "<i>No description provided.</i>",
        assignee: event.payload.pull_request.assignee?.login ?? "No Assignee",
        author: event.payload.pull_request.user.login
      }) + transformLabels(event.payload.pull_request.labels);

    try {
      await ctx.telegram.sendMessage(
        ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
        response,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    } catch (e) {
      console.error(e);
    }
  };
}

export function prEdited(
  ctx: Context
): HandlerFunction<"pull_request.edited", unknown> {
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
        body:
          (body.length > 100 ? body.slice(0, 100) + "..." : body) ||
          "<i>No description provided.</i>",
        assignee: event.payload.pull_request.assignee?.login ?? "No Assignee",
        author: event.payload.pull_request.user.login,
        actor: event.payload.sender.login
      }) + transformLabels(event.payload.pull_request.labels);

    prSubject$.next([ctx, response]);
  };
}

export function prReviewSubmitted(
  ctx: Context
): HandlerFunction<"pull_request_review.submitted", unknown> {
  const TITLE: Record<string, string> = {
    commented:
      "<b>💬 PR review submitted in <a href=\"{{url}}\">#{{no}} {{title}}</a> by {{actor}}</b>",
    approved:
      "<b>✅ PR <a href=\"{{url}}\">#{{no}} {{title}}</a> has been approved by {{actor}}</b>",
    changes_requested:
      "<b>🚫 {{actor}} requested a change for PR <a href=\"{{url}}\">#{{no}} {{title}}</a></b>"
  };
  const template = `

{{body}}

<b>PR author</b>: {{author}}
<b>See</b>: {{reviewUrl}}`;
  return async (event) => {
    const body = markdownToHTML(event.payload.review?.body ?? "");
    const response = templite(
      TITLE[event.payload.review.state.toLowerCase()] + template,
      {
        repoName: event.payload.repository.full_name,
        url: event.payload.pull_request.html_url,
        no: event.payload.pull_request.number,
        title: event.payload.pull_request.title,
        body: 
          (body.length > 100 ? body.slice(0, 100) + "..." : body) ||
          "<i>No description provided.</i>",
        author: event.payload.review.user.login,
        reviewUrl: event.payload.review.html_url,
        actor: event.payload.sender.login
      }
    );

    try {
      await ctx.telegram.sendMessage(
        ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
        response,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    } catch (e) {
      console.error(e);
    }
  };
}

export function prReviewEdited(
  ctx: Context
): HandlerFunction<"pull_request_review.edited", unknown> {
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
      body: body.length > 100 ? body.slice(0, 100) + "..." : body,
      author: event.payload.review.user.login,
      reviewUrl: event.payload.review.html_url,
      actor: event.payload.sender.login
    });

    prSubject$.next([ctx, response]);
  };
}
