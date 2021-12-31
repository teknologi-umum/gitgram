import { Subject, throttleTime, asyncScheduler } from "rxjs";
import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";
import templite from "templite";
import { transformLabels } from "../utils/transformLabels";
import { markdownToHTML } from "../utils/markdown";

const issueSubject$ = new Subject<[Context, string]>();

issueSubject$
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

export function issueCommentCreated(
  ctx: Context
): HandlerFunction<"issue_comment.created", unknown> {
  const template = `<b>💬 New {{where}} comment in <a href="{{url}}">#{{no}} {{title}}</a> by {{actor}}</b>

{{body}}

<b>{{where}} author</b>: {{author}}
<b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;

  return async (event) => {
    const isPR = event.payload.issue.pull_request?.url;
    const body = markdownToHTML(event.payload.comment.body);
    const response = templite(template, {
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

export function issueClosed(
  ctx: Context
): HandlerFunction<"issues.closed", unknown> {
  const template = `<b>🚫 Issue <a href="{{url}}">#{{no}} {{title}}</a> was closed by {{actor}}</b>

<b>Assignee</b>: {{assignee}}
<b>Issue author</b>: <a href="https://github.com/{{author}}">{{author}}</a>
<b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;

  return async (event) => {
    const response =
      templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.issue.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        assignee: event.payload.issue.assignee?.login ?? "No Assignee",
        author: event.payload.issue.user.login,
        actor: event.payload.sender.login
      }) + transformLabels(event.payload.issue.labels);

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

export function issueOpened(
  ctx: Context
): HandlerFunction<"issues.opened", unknown> {
  const template = `
<b>🌱 New issue <a href="{{url}}">#{{no}} {{title}}</a> was opened by {{author}}</b>

{{body}}

<b>Assignee</b>: {{assignee}}
<b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;

  return async (event) => {
    const body = markdownToHTML(event.payload.issue?.body ?? "");
    const response =
      templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.issue.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        body: body || "<i>No description provided.</i>",
        assignee: event.payload.issue.assignee?.login ?? "No Assignee",
        author: event.payload.issue.user.login
      }) + transformLabels(event.payload.issue.labels);

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

export function issueReopened(
  ctx: Context
): HandlerFunction<"issues.reopened", unknown> {
  const template = `
<b>🌱 Issue <a href="{{url}}">#{{no}} {{title}}</a> was reopened by {{actor}}</b>

<b>Assignee</b>: {{assignee}}
<b>Issue author</b>: {{author}}
<b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;

  return async (event) => {
    const response =
      templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.issue.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        assignee: event.payload.issue.assignee?.login ?? "No Assignee",
        author: event.payload.issue.user.login,
        actor: event.payload.sender.login
      }) + transformLabels(event.payload.issue.labels);

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

export function issueEdited(
  ctx: Context
): HandlerFunction<"issues.edited", unknown> {
  const template = `
<b>🌱 Issue <a href="{{url}}">#{{no}} {{title}}</a> was edited by {{actor}}</b>

<b>Assignee</b>: {{assignee}}
<b>Issue author</b>: {{author}}
<b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;

  return (event) => {
    const response =
      templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.issue.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        assignee: event.payload.issue.assignee?.login ?? "No Assignee",
        author: event.payload.issue.user.login,
        actor: event.payload.sender.login
      }) + transformLabels(event.payload.issue.labels);

    issueSubject$.next([ctx, response]);
  };
}

export function issueCommentEdited(
  ctx: Context
): HandlerFunction<"issue_comment.edited", unknown> {
  const template = `
<b>💬 Issue comment on <a href="{{url}}">#{{no}} {{title}}</a> was edited by {{actor}}</b>

{{body}}

<b>Issue author</b>: {{author}}
<b>Repo</b>: <a href="https://github.com/{{repoName}}">{{repoName}}</a>`;

  return (event) => {
    const body = markdownToHTML(event.payload.issue?.body ?? "");
    const response =
      templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.issue.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        body: body || "<i>No description provided.</i>",
        assignee: event.payload.issue.assignee?.login ?? "No Assignee",
        author: event.payload.issue.user.login,
        actor: event.payload.sender.login
      }) + transformLabels(event.payload.issue.labels);

    issueSubject$.next([ctx, response]);
  };
}
