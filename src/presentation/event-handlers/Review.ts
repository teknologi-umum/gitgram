import { z } from "zod";
import type { IReviewEvent } from "~/application/interfaces/events";
import { markdownToHTML } from "~/utils/markdown";
import type { HandlerFunction } from "~/application/webhook/types";
import type { IPresenter } from "~/application/interfaces/IPresenter";
import { interpolate } from "~/utils/interpolate";

export const reviewTemplateSchema = z.object({
  submitted: z.object({
    base: z.string().trim(),
    type: z.record(z.string())
  }),
  edited: z.string().trim(),
  created: z.string().trim()
});

export type ReviewTemplate = z.infer<typeof reviewTemplateSchema>;

export class ReviewEventHandler implements IReviewEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: ReviewTemplate, private readonly _hub: IPresenter) {}

  submitted(): HandlerFunction<"pull_request_review.submitted"> {
    return (event) => {
      if (event.payload.review.body === null) {
        // don't do anything because Github sends this event with `null` body whenever
        // someone commented on a review.
        return;
      }

      const body = markdownToHTML(event.payload.review.body);
      const response = interpolate(
        this._templates.submitted.type[event.payload.review.state.toLowerCase()] + this._templates.submitted.base,
        {
          repoName: event.payload.repository.fullName,
          url: event.payload.pullRequest.url,
          no: event.payload.pullRequest.number,
          title: event.payload.pullRequest.title,
          body: body,
          author: event.payload.pullRequest.user.name,
          reviewUrl: event.payload.review.url,
          actor: event.payload.sender.name
        }
      );

      this._hub.send({
        event: "pull_request_review.submitted",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  edited(): HandlerFunction<"pull_request_review.edited"> {
    return (event) => {
      if (!event.payload.review.body) return;
      const body = markdownToHTML(event.payload.review.body);
      const response = interpolate(this._templates.edited, {
        repoName: event.payload.repository.fullName,
        url: event.payload.pullRequest.url,
        no: event.payload.pullRequest.number,
        title: event.payload.pullRequest.title,
        body: body,
        author: event.payload.pullRequest.user.name,
        reviewUrl: event.payload.review.url,
        actor: event.payload.sender.name
      });

      this._hub.send({
        event: "pull_request_review.edited",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }

  created(): HandlerFunction<"pull_request_review_comment.created"> {
    return (event) => {
      const body = markdownToHTML(event.payload.comment.body);
      const response = interpolate(this._templates.created, {
        repoName: event.payload.repository.fullName,
        url: event.payload.pullRequest.url,
        no: event.payload.pullRequest.number,
        title: event.payload.pullRequest.title,
        body: body || "<i>No description provided.</i>",
        author: event.payload.pullRequest.user.name,
        reviewUrl: event.payload.comment.url,
        actor: event.payload.sender.name
      });

      this._hub.send({
        event: "pull_request_review_comment.created",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }
}
