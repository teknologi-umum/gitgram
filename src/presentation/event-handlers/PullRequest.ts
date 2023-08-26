import { z } from "zod";
import type { IPullRequestEvent } from "~/application/interfaces/events";
import { markdownToHTML } from "~/utils/markdown";
import { transformLabels } from "~/utils/transformLabels";
import type { HandlerFunction } from "~/application/webhook/types";
import type { IPresenter } from "~/application/interfaces/IPresenter";
import { interpolate } from "~/utils/interpolate";

export const pullRequestTemplateSchema = z.object({
  closed: z.object({
    base: z.string().trim(),
    type: z.object({
      merged: z.string().trim(),
      closed: z.string().trim()
    })
  }),
  opened: z.string().trim(),
  edited: z.string().trim()
});

export type PullRequestTemplate = z.infer<typeof pullRequestTemplateSchema>;

export class PullRequestEventHandler implements IPullRequestEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: PullRequestTemplate, private readonly _hub: IPresenter) {}

  closed(): HandlerFunction<"pull_request.closed"> {
    return (event) => {
      let template = this._templates.closed.base;

      if (event.payload.pullRequest.isMerged) {
        template = this._templates.closed.type.merged + "\n" + this._templates.closed.base;
      } else {
        template = this._templates.closed.type.closed + "\n" + this._templates.closed.base;
      }

      const body = markdownToHTML(event.payload.pullRequest?.body ?? "");
      const response =
        interpolate(template, {
          url: event.payload.pullRequest.url,
          no: event.payload.pullRequest.number,
          title: event.payload.pullRequest.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.pullRequest.assignee?.name || "<i>No Assignee</i>",
          author: event.payload.pullRequest.user.name,
          repoName: event.payload.repository.fullName,
          actor: event.payload.sender.name
        }) + "\n" + transformLabels(event.payload.pullRequest.labels);

      this._hub.send({
        event: "pull_request.closed",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  opened(): HandlerFunction<"pull_request.opened"> {
    const template = this._templates.opened;
    return (event) => {
      const body = markdownToHTML(event.payload.pullRequest?.body ?? "");
      const response =
        interpolate(template, {
          url: event.payload.pullRequest.url,
          repoName: event.payload.repository.fullName,
          no: event.payload.pullRequest.number,
          title: event.payload.pullRequest.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.pullRequest.assignee?.name || "<i>No Assignee</i>",
          author: event.payload.pullRequest.user.name
        }) + "\n" + transformLabels(event.payload.pullRequest.labels);

      this._hub.send({
        event: "pull_request.opened",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  edited(): HandlerFunction<"pull_request.edited"> {
    return (event) => {
      const body = markdownToHTML(event.payload.pullRequest?.body ?? "");
      const response =
        interpolate(this._templates.edited, {
          url: event.payload.pullRequest.url,
          repoName: event.payload.repository.fullName,
          no: event.payload.pullRequest.number,
          title: event.payload.pullRequest.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.pullRequest.assignee?.name || "<i>No Assignee</i>",
          author: event.payload.pullRequest.user.name,
          actor: event.payload.sender.name
        }) + "\n" + transformLabels(event.payload.pullRequest.labels);

      this._hub.send({
        event: "pull_request.edited",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }
}