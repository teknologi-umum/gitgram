import type { IPullRequestEvent } from "~/application/interfaces/events";
import { markdownToHTML } from "~/utils/markdown";
import { transformLabels } from "~/utils/transformLabels";
import type { HandlerFunction } from "~/application/webhook/types";
import type { IHub } from "~/application/interfaces/IHub";
import { interpolate } from "~/utils/interpolate";

export type PullRequestTemplate = {
  closed: {
    base: string;
    type: {
      merged: string;
      closed: string;
    };
  };
  opened: string;
  edited: string;
};

export class PullRequestEventHandler implements IPullRequestEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: PullRequestTemplate, private readonly _hub: IHub) {}

  closed(): HandlerFunction<"pull_request.closed"> {
    return (event) => {
      let template = this._templates.closed.base;

      if (event.payload.pull_request.merged) {
        template = this._templates.closed.type.merged + this._templates.closed.base;
      } else {
        template = this._templates.closed.type.closed + this._templates.closed.base;
      }

      const body = markdownToHTML(event.payload.pull_request?.body ?? "");
      const response =
        interpolate(template, {
          url: event.payload.pull_request.html_url,
          no: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.pull_request.assignee?.login || "No Assignee",
          author: event.payload.pull_request.user.login,
          repoName: event.payload.repository.full_name,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.pull_request.labels);

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  opened(): HandlerFunction<"pull_request.opened"> {
    const template = this._templates.opened;
    return (event) => {
      const body = markdownToHTML(event.payload.pull_request?.body ?? "");
      const response =
        interpolate(template, {
          url: event.payload.pull_request.html_url,
          repoName: event.payload.repository.full_name,
          no: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.pull_request.assignee?.login || "No Assignee",
          author: event.payload.pull_request.user.login
        }) + transformLabels(event.payload.pull_request.labels);

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  edited(): HandlerFunction<"pull_request.edited"> {
    return (event) => {
      const body = markdownToHTML(event.payload.pull_request?.body ?? "");
      const response =
        interpolate(this._templates.edited, {
          url: event.payload.pull_request.html_url,
          repoName: event.payload.repository.full_name,
          no: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          body: body || "<i>No description provided.</i>",
          assignee: event.payload.pull_request.assignee?.login || "No Assignee",
          author: event.payload.pull_request.user.login,
          actor: event.payload.sender.login
        }) + transformLabels(event.payload.pull_request.labels);

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }
}
