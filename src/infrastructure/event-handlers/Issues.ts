import { z } from "zod";
import type { IIssueEvent } from "~/application/interfaces/events";
import { markdownToHTML } from "~/utils/markdown";
import { transformLabels } from "~/utils/transformLabels";
import type { HandlerFunction } from "~/application/webhook/types";
import type { IHub } from "~/application/interfaces/IHub";
import { interpolate } from "~/utils/interpolate";

export const issueTemplateSchema = z.object({
  closed: z.string(),
  opened: z.string(),
  reopened: z.string(),
  edited: z.string(),
  commentCreated: z.string(),
  commentEdited: z.string()
});

export type IssueTemplate = z.infer<typeof issueTemplateSchema>;

export class IssuesEventHandler implements IIssueEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: IssueTemplate, private readonly _hub: IHub) {}

  closed(): HandlerFunction<"issue.closed"> {
    return (event) => {
      const response =
        interpolate(this._templates.closed, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  opened(): HandlerFunction<"issue.opened"> {
    return (event) => {
      const body = markdownToHTML(event.payload.issue?.body ?? "");
      const response =
        interpolate(this._templates.opened, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  reopened(): HandlerFunction<"issue.reopened"> {
    return (event) => {
      const response =
        interpolate(this._templates.reopened, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  edited(): HandlerFunction<"issue.edited"> {
    return (event) => {
      const response =
        interpolate(this._templates.edited, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  commentCreated(): HandlerFunction<"issue_comment.created"> {
    return (event) => {
      const isPR = event.payload.issue.pull_request?.url;
      const body = markdownToHTML(event.payload.comment.body);
      const response = interpolate(this._templates.commentCreated, {
        repoName: event.payload.repository.full_name,
        url: event.payload.comment.html_url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        body: body || "<i>Comment was empty.</i>",
        author: event.payload.issue.user.login,
        actor: event.payload.comment.user.login,
        where: isPR ? "PR" : "Issue"
      });

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  commentEdited(): HandlerFunction<"issue_comment.edited"> {
    return (event) => {
      const body = markdownToHTML(event.payload.issue?.body ?? "");
      const response =
        interpolate(this._templates.commentEdited, {
          repoName: event.payload.repository.full_name,
          url: event.payload.issue.html_url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.issue.assignee?.login ?? "No Assignee",
          author: event.payload.issue.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }
}
