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
  let template = `
{{body}}

<b>Assignee</b>: {{assignee}}
<b>Author</b>: {{author}}`;

  return async (event) => {
    if (event.payload.pull_request.merged) {
      template =
        `
<b>🔮 Pull request was merged in <a href="https://github.com/{{repoName}}">{{repoName}}</a></b>
<b><a href="{{url}}">#{{no}} {{title}}</a></b>` + template;
    } else {
      template =
        `
<b>🔮 Pull request was closed with unmerged commits in <a href="https://github.com/{{repoName}}">{{repoName}}</a></b>
<b><a href="{{url}}">#{{no}} {{title}}</a></b>` + template;
    }

    const response =
      templite(template, {
        url: event.payload.pull_request.html_url,
        no: event.payload.pull_request.number,
        title: event.payload.pull_request.title,
        body:
          markdownToHTML(event.payload.pull_request?.body ?? "") ||
          "<i>No description provided.</i>",
        assignee: event.payload.pull_request.assignee?.login ?? "No Assignee",
        author: event.payload.pull_request.user.login,
        repoName: event.payload.repository.name
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
<b>🔮 New pull request was opened in <a href="https://github.com/{{repoName}}">{{repoName}}</a></b>
<b><a href="{{url}}">#{{no}} {{title}}</a></b>

{{body}}

<b>Assignee</b>: {{assignee}}
<b>Author</b>: {{author}}`;
  return async (event) => {
    const response =
      templite(template, {
        url: event.payload.pull_request.html_url,
        repoName: event.payload.repository.full_name,
        no: event.payload.pull_request.number,
        title: event.payload.pull_request.title,
        body:
          markdownToHTML(event.payload.pull_request?.body ?? "") ||
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
<b>🔮 A pull request was edited in <a href="https://github.com/{{repoName}}">{{repoName}}</a></b>
<b><a href="{{url}}">#{{no}} {{title}}</a></b>

{{body}}

<b>Assignee</b>: {{assignee}}
<b>Author</b>: {{author}}`;

  return (event) => {
    const response =
      templite(template, {
        url: event.payload.pull_request.html_url,
        repoName: event.payload.repository.full_name,
        no: event.payload.pull_request.number,
        title: event.payload.pull_request.title,
        body:
          markdownToHTML(event.payload.pull_request?.body ?? "") ||
          "<i>No description provided.</i>",
        assignee: event.payload.pull_request.assignee?.login ?? "No Assignee",
        author: event.payload.pull_request.user.login
      }) + transformLabels(event.payload.pull_request.labels);

    prSubject$.next([ctx, response]);
  };
}

export function prReviewSubmitted(
  ctx: Context
): HandlerFunction<"pull_request_review.submitted", unknown> {
  const TITLE: Record<string, string> = {
    commented:
      "<b>💬 new pull request review submitted in <a href=\"https://github.com/{{reponame}}\">{{reponame}}</a></b>",
    approved:
      "<b>✅ a pull request has been approved in <a href=\"https://github.com/{{reponame}}\">{{reponame}}</a></b>",
    changes_requested:
      "<b>🚫 change requested for a pull request in <a href=\"https://github.com/{{reponame}}\">{{reponame}}</a></b>"
  };
  const template = `
<b><a href="{{url}}">#{{no}} {{title}}</a></b>

{{body}}

<b>Author</b>: {{author}}
<b>See</b>: {{reviewUrl}}`;
  return async (event) => {
    if (!event.payload.review.body) return;

    const response = templite(
      TITLE[event.payload.review.state.toLowerCase()] + template,
      {
        repoName: event.payload.repository.full_name,
        url: event.payload.pull_request.html_url,
        no: event.payload.pull_request.number,
        title: event.payload.pull_request.title,
        body: markdownToHTML(event.payload.review.body),
        author: event.payload.review.user.login,
        reviewUrl: event.payload.review.html_url
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
<b>🔮 A pull request review was edited in <a href="https://github.com/{{repoName}}">{{repoName}}</a></b>
<b><a href="{{url}}">#{{no}} {{title}}</a></b>

{{body}}

<b>Assignee</b>: {{assignee}}
<b>Author</b>: {{author}}`;
  return (event) => {
    if (!event.payload.review.body) return;

    const response = templite(template, {
      repoName: event.payload.repository.full_name,
      url: event.payload.pull_request.html_url,
      no: event.payload.pull_request.number,
      title: event.payload.pull_request.title,
      body: markdownToHTML(event.payload.review.body),
      author: event.payload.review.user.login,
      reviewUrl: event.payload.review.html_url
    });

    prSubject$.next([ctx, response]);
  };
}
