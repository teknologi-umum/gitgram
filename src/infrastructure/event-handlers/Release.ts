import type { IReleaseEvent } from "~/application/interfaces/events";
import { markdownToHTML } from "~/utils/markdown";
import type { HandlerFunction } from "~/application/webhook/types";
import type { IHub } from "~/application/interfaces/IHub";
import { interpolate } from "~/utils/interpolate";

export type ReleaseTemplate = {
  published: string;
};

export class ReleaseEventHandler implements IReleaseEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: ReleaseTemplate, private readonly _hub: IHub) {}

  published(): HandlerFunction<"release.published"> {
    return (event) => {
      const body = markdownToHTML(event.payload.release.body);
      const response = interpolate(this._templates.published, {
        tag_name: event.payload.release.tag_name,
        repoName: event.payload.repository.full_name,
        name: event.payload.release.name,
        url: event.payload.release.url,
        body: body || "<i>No description provided.</i>",
        actor: event.payload.sender.login
      });

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }
}
