import { trace } from "@opentelemetry/api";
import { z } from "zod";
import type { IPresenter } from "~/application/interfaces/IPresenter";
import type { IDiscussionEvent } from "~/application/interfaces/events/IDiscussionEvent";
import type { HandlerFunction } from "~/application/webhook/types";
import { interpolate } from "~/utils/interpolate";

const tracer = trace.getTracer("presentation.event-handlers.Discussion");

export const discussionTemplateSchema = z.object({
  created: z.string().trim(),
  closed: z.string().trim(),
  reopened: z.string().trim(),
  edited: z.string().trim(),
  deleted: z.string().trim(),
  pinned: z.string().trim(),
  answered: z.string().trim(),
  comment_created: z.string().trim()
});

export type DiscussionTemplate = z.infer<typeof discussionTemplateSchema>;

export class DiscussionEventHandler implements IDiscussionEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: DiscussionTemplate, private readonly _hub: IPresenter) {
  }

  created(): HandlerFunction<"discussion.created"> {
    return (event) => {
      return tracer.startActiveSpan("created", () => {
        const message = this._templates.created;
        const payload = interpolate(message, {
          url: event.payload.discussion.url,
          no: event.payload.discussion.number,
          title: event.payload.discussion.title,
          body: event.payload.discussion.body,
          repoName: event.payload.repository.fullName,
          category: `${event.payload.discussion.category.emoji} ${event.payload.discussion.category.name}`,
          author: event.payload.discussion.user.name
        });
        this._hub.send({
          payload: payload,
          event: "discussion.created",
          targetsId: event.targetsId
        });
      });
    };
  }

  closed(): HandlerFunction<"discussion.closed"> {
    return (event) => {
      return tracer.startActiveSpan("closed", () => {
        const message = this._templates.closed;
        const payload = interpolate(message, {
          url: event.payload.discussion.url,
          no: event.payload.discussion.number,
          title: event.payload.discussion.title,
          body: event.payload.discussion.body,
          repoName: event.payload.repository.fullName,
          category: `${event.payload.discussion.category.emoji} ${event.payload.discussion.category.name}`,
          actor: event.payload.sender.name
        });
        this._hub.send({
          payload: payload,
          event: "discussion.closed",
          targetsId: event.targetsId
        });
      });
    };
  }

  reopened(): HandlerFunction<"discussion.reopened"> {
    return (event) => {
      return tracer.startActiveSpan("reopened", () => {
        const message = this._templates.reopened;
        const payload = interpolate(message, {
          url: event.payload.discussion.url,
          no: event.payload.discussion.number,
          title: event.payload.discussion.title,
          body: event.payload.discussion.body,
          repoName: event.payload.repository.fullName,
          category: `${event.payload.discussion.category.emoji} ${event.payload.discussion.category.name}`,
          actor: event.payload.sender.name
        });
        this._hub.send({
          payload: payload,
          event: "discussion.reopened",
          targetsId: event.targetsId
        });
      });
    };
  }

  edited(): HandlerFunction<"discussion.edited"> {
    return (event) => {
      return tracer.startActiveSpan("edited", () => {
        const message = this._templates.edited;
        const payload = interpolate(message, {
          url: event.payload.discussion.url,
          no: event.payload.discussion.number,
          title: event.payload.discussion.title,
          body: event.payload.discussion.body,
          repoName: event.payload.repository.fullName,
          category: `${event.payload.discussion.category.emoji} ${event.payload.discussion.category.name}`,
          actor: event.payload.sender.name
        });
        this._hub.send({
          payload: payload,
          event: "discussion.edited",
          targetsId: event.targetsId
        });
      });
    };
  }

  deleted(): HandlerFunction<"discussion.deleted"> {
    return (event) => {
      return tracer.startActiveSpan("deleted", () => {
        const message = this._templates.deleted;
        const payload = interpolate(message, {
          url: event.payload.discussion.url,
          no: event.payload.discussion.number,
          title: event.payload.discussion.title,
          body: event.payload.discussion.body,
          repoName: event.payload.repository.fullName,
          category: `${event.payload.discussion.category.emoji} ${event.payload.discussion.category.name}`,
          actor: event.payload.sender.name
        });
        this._hub.send({
          payload: payload,
          event: "discussion.deleted",
          targetsId: event.targetsId
        });
      });
    };
  }

  pinned(): HandlerFunction<"discussion.pinned"> {
    return (event) => {
      return tracer.startActiveSpan("pinned", () => {
        const message = this._templates.pinned;
        const payload = interpolate(message, {
          url: event.payload.discussion.url,
          no: event.payload.discussion.number,
          title: event.payload.discussion.title,
          body: event.payload.discussion.body,
          repoName: event.payload.repository.fullName,
          category: `${event.payload.discussion.category.emoji} ${event.payload.discussion.category.name}`,
          actor: event.payload.sender.name
        });
        this._hub.send({
          payload: payload,
          event: "discussion.pinned",
          targetsId: event.targetsId
        });
      });
    };
  }

  answered(): HandlerFunction<"discussion.answered"> {
    return (event) => {
      const message = this._templates.answered;
      const payload = interpolate(message, {
        url: event.payload.discussion.url,
        no: event.payload.discussion.number,
        title: event.payload.discussion.title,
        body: event.payload.answer.body,
        repoName: event.payload.repository.fullName,
        category: `${event.payload.discussion.category.emoji} ${event.payload.discussion.category.name}`,
        actor: event.payload.sender.name
      });
      this._hub.send({
        payload: payload,
        event: "discussion.answered",
        targetsId: event.targetsId
      });
    };
  }

  commentCreated(): HandlerFunction<"discussion_comment.created"> {
    return (event) => {
      const message = this._templates.comment_created;
      const payload = interpolate(message, {
        no: event.payload.discussion.number,
        title: event.payload.discussion.title,
        url: event.payload.comment.url,
        body: event.payload.comment.body,
        repoName: event.payload.repository.fullName,
        category: `${event.payload.discussion.category.emoji} ${event.payload.discussion.category.name}`,
        actor: event.payload.sender.name,
        replyCount: event.payload.comment.replyCount
      });
      this._hub.send({
        payload: payload,
        event: "discussion_comment.created",
        targetsId: event.targetsId
      });
    };
  }
}