import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";
import templite from "templite";
import { transformLabels } from "../utils/transformLabels";

export function issueCommentCreated(
  ctx: Context
): HandlerFunction<"issue_comment.created", unknown> {
  const template = `
<b>💬 New issue comment in <a href="https://github.com/{{repoName}}">{{repoName}}</a></b>
<b><a href="{{url}}">#{{no}} {{title}}</a></b>

{{ body }}

<b>Author</b>: <a href="https://github.com/{{author}}">{{author}}</a>`;

  return async (event) => {
    const response = templite(template, {
      repoName: event.payload.repository.full_name,
      url: event.payload.issue.html_url,
      no: event.payload.issue.number,
      title: event.payload.issue.title,
      body: event.payload.comment.body || "<i>Comment was empty.</i>",
      author: event.payload.comment.user.login
    });

    await ctx.telegram.sendMessage(
      ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
      response,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
  };
}

export function issueClosed(
  ctx: Context
): HandlerFunction<"issues.closed", unknown> {
  const template = `
<b>🚫 Issue was closed in <a href="https://github.com/{{repoName}}">{{repoName}}</a></b>
<b><a href="{{url}}">#{{no}} {{title}}</a></b>

<b>Assignee</b>: {{assignee}}
<b>Author</b>: <a href="https://github.com/{{author}}">{{author}}</a>`;

  return async (event) => {
    const response =
      templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.issue.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        assignee: event.payload.issue.assignee?.login ?? "No Assignee",
        author: event.payload.issue.user.login
      }) + transformLabels(event.payload.issue.labels);

    await ctx.telegram.sendMessage(
      ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
      response,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
  };
}

export function issueOpened(
  ctx: Context
): HandlerFunction<"issues.opened", unknown> {
  const template = `
<b>🌱 New issue was opened in <a href="https://github.com/{{repoName}}">{{repoName}}</a></b>
<b><a href="{{url}}">#{{no}} {{title}}</a></b>

{{body}}

<b>Assignee</b>: {{assignee}}
<b>Author</b>: {{author}}`;

  return async (event) => {
    const response =
      templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.issue.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        body: event.payload.issue.body || "<i>No description provided.</i>",
        assignee: event.payload.issue.assignee?.login ?? "No Assignee",
        author: event.payload.issue.user.login
      }) + transformLabels(event.payload.issue.labels);

    await ctx.telegram.sendMessage(
      ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
      response,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
  };
}

export function issueReopened(
  ctx: Context
): HandlerFunction<"issues.reopened", unknown> {
  const template = `
<b>🌱 An issue was reopened in <a href="https://github.com/{{repoName}}">{{repoName}}</a></b>

<b><a href="{{url}}">#{{no}} {{title}}</a></b>

<b>Assignee</b>: {{assignee}}
<b>Author</b>: <a href="https://github.com/{{author}}">{{author}}</a>`;

  return async (event) => {
    const response =
      templite(template, {
        repoName: event.payload.repository.full_name,
        url: event.payload.issue.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        assignee: event.payload.issue.assignee?.login ?? "No Assignee",
        author: event.payload.issue.user.login
      }) + transformLabels(event.payload.issue.labels);

    await ctx.telegram.sendMessage(
      ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
      response,
      { parse_mode: "HTML", disable_web_page_preview: true }
    );
  };
}
