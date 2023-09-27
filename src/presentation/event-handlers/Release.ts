import { z } from "zod";
import type { IReleaseEvent } from "~/application/interfaces/events";
import { markdownToHTML } from "~/utils/markdown";
import type { HandlerFunction } from "~/application/webhook/types";
import type { IPresenter } from "~/application/interfaces/IPresenter";
import { interpolate } from "~/utils/interpolate";

export const releaseTemplateSchema = z.object({
  published: z.string().trim()
});

export type ReleaseTemplate = z.infer<typeof releaseTemplateSchema>;

export class ReleaseEventHandler implements IReleaseEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: ReleaseTemplate, private readonly _hub: IPresenter) {}

  published(): HandlerFunction<"release.published"> {
    return (event) => {
      const body = markdownToHTML(event.payload.release.body);
      const response = interpolate(this._templates.published, {
        tag_name: event.payload.release.tagName,
        repoName: event.payload.repository.fullName,
        name: event.payload.release.name,
        url: event.payload.release.url,
        body: body || "<i>No description provided.</i>",
        actor: event.payload.sender.name
      });

      this._hub.send({
        event: "release.published",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }
}