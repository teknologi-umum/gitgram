import type { WebhookEvent } from "@octokit/webhooks-types";
import { Hono, type Context, type Next } from "hono";
import type { ServerConfig } from "./types";
import type { IRoute } from "~/application/interfaces/IRoute";
import type { WebhookEventName } from "~/application/webhook/types";

export class GithubRoute implements IRoute {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _server: Hono, private readonly _config: ServerConfig<WebhookEvent>) { }

  public register() {
    // handle issues events
    this._config.webhook.on("issues.opened", this._config.handlers.issues.opened());
    this._config.webhook.on("issues.closed", this._config.handlers.issues.closed());
    this._config.webhook.on("issues.edited", this._config.handlers.issues.edited());
    this._config.webhook.on("issues.reopened", this._config.handlers.issues.reopened());
    this._config.webhook.on("issue_comment.created", this._config.handlers.issues.commentCreated());
    this._config.webhook.on("issue_comment.edited", this._config.handlers.issues.commentEdited());

    // handle pull requests events
    this._config.webhook.on("pull_request.opened", this._config.handlers.pr.opened());
    this._config.webhook.on("pull_request.closed", this._config.handlers.pr.closed());
    this._config.webhook.on("pull_request.edited", this._config.handlers.pr.edited());

    // handle reviews events
    this._config.webhook.on("pull_request_review.submitted", this._config.handlers.review.submitted());
    this._config.webhook.on("pull_request_review_comment.created", this._config.handlers.review.created());
    this._config.webhook.on("pull_request_review.edited", this._config.handlers.review.edited());

    // handle release events
    this._config.webhook.on("release.published", this._config.handlers.release.published());
    this._config.webhook.on("deployment_status", this._config.handlers.deployment.status());

    // handle discussion events
    this._config.webhook.on("discussion.created", this._config.handlers.discussion.created());
    this._config.webhook.on("discussion.edited", this._config.handlers.discussion.edited());
    this._config.webhook.on("discussion.deleted", this._config.handlers.discussion.deleted());
    this._config.webhook.on("discussion.pinned", this._config.handlers.discussion.pinned());
    this._config.webhook.on("discussion.answered", this._config.handlers.discussion.answered());
    this._config.webhook.on("discussion.reopened", this._config.handlers.discussion.reopened());
    this._config.webhook.on("discussion_comment.created", this._config.handlers.discussion.commentCreated());

    // attach routes
    this._server.use(this._config.path, this.verifySignature.bind(this));
    this._server.post(this._config.path, this.handleWebhook.bind(this));
  }

  private async handleWebhook(c: Context) {
    const requestBody = await c.req.json();
    const event = c.req.header("x-github-event");
    const eventType = requestBody.action !== undefined ? `.${requestBody.action}` : "";
    const eventName = `${event}${eventType}` as WebhookEventName;
    const targetIds = this._config.groupMapping.findGroupsIn(requestBody.repository.html_url);
    // reply back first so github knows we've received it before waiting us handling the response
    this._config.webhook.handle(eventName, requestBody, targetIds);
    return c.json({ msg: "OK" }, 200);
  }

  private async verifySignature(c: Context, next: Next) {
    const hubSignature = c.req.header("x-hub-signature-256");
    if (hubSignature === undefined || hubSignature.length === 0) {
      return c.json({ msg: "Signature length is not the same." }, 401);
    }

    const requestBody = await c.req.json();
    
    const isEqual = await this._config.webhook.verify(JSON.stringify(requestBody), hubSignature);
    if (!isEqual) {
      return c.json({ msg: "Invalid signature" }, 401);
    }

    return next();
  }
}