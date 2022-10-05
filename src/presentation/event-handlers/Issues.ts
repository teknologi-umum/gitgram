import { z } from "zod";
import type { IIssueEvent } from "~/application/interfaces/events";
import { markdownToHTML } from "~/utils/markdown";
import { transformLabels } from "~/utils/transformLabels";
import type { HandlerFunction } from "~/application/webhook/types";
import type { IPresenter } from "~/application/interfaces/IPresenter";
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
  constructor(private readonly _templates: IssueTemplate, private readonly _hub: IPresenter) {}

  closed(): HandlerFunction<"issue.closed"> {
    return (event) => {
      const response =
        interpolate(this._templates.closed, {
          repoName: event.payload.repository.fullName,
          url: event.payload.issue.url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          assignee: event.payload.issue.assignee?.name ?? "No Assignee",
          author: event.payload.issue.user.name,
          actor: event.payload.sender.name
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        event: "issue.closed",
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
          repoName: event.payload.repository.fullName,
          url: event.payload.issue.url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.issue.assignee?.name ?? "No Assignee",
          author: event.payload.issue.user.name
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        event: "issue.opened",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  reopened(): HandlerFunction<"issue.reopened"> {
    return (event) => {
      const response =
        interpolate(this._templates.reopened, {
          repoName: event.payload.repository.fullName,
          url: event.payload.issue.url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          assignee: event.payload.issue.assignee?.name ?? "No Assignee",
          author: event.payload.issue.user.name,
          actor: event.payload.sender.name
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        event: "issue.reopened",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  edited(): HandlerFunction<"issue.edited"> {
    return (event) => {
      const response =
        interpolate(this._templates.edited, {
          repoName: event.payload.repository.fullName,
          url: event.payload.issue.url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          assignee: event.payload.issue.assignee?.name ?? "No Assignee",
          author: event.payload.issue.user.name,
          actor: event.payload.sender.name
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        event: "issue.edited",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  commentCreated(): HandlerFunction<"issue_comment.created"> {
    return (event) => {
      const isPR = event.payload.issue.pullRequest?.url;
      const body = markdownToHTML(event.payload.comment.body);
      const response = interpolate(this._templates.commentCreated, {
        repoName: event.payload.repository.fullName,
        url: event.payload.comment.url,
        no: event.payload.issue.number,
        title: event.payload.issue.title,
        body: body || "<i>Comment was empty.</i>",
        author: event.payload.issue.user.name,
        actor: event.payload.comment.user.name,
        where: isPR ? "PR" : "Issue"
      });

      this._hub.send({
        event: "issue_comment.created",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  commentEdited(): HandlerFunction<"issue_comment.edited"> {
    return (event) => {
      const oldBody = markdownToHTML(event.payload.changes?.body.from ?? "");
      const newBody = markdownToHTML(event.payload.comment.body ?? "");
      const response =
        interpolate(this._templates.commentEdited, {
          repoName: event.payload.repository.fullName,
          url: event.payload.issue.url,
          no: event.payload.issue.number,
          title: event.payload.issue.title,
          oldBody: oldBody,
          newBody: newBody,
          assignee: event.payload.issue.assignee?.name ?? "No Assignee",
          author: event.payload.issue.user.name,
          actor: event.payload.sender.name
        }) + transformLabels(event.payload.issue.labels);

      this._hub.send({
        event: "issue_comment.edited",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }
}
