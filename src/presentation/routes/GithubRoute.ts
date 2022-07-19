import type { WebhookEvent } from "@octokit/webhooks-types";
import type { NextHandler, Polka, Request, Response } from "polka";
import type { ServerConfig } from "./types";
import type { IRoute } from "~/application/interfaces/IRoute";
import type { WebhookEventName } from "~/application/webhook/types";

export class GithubRoute implements IRoute {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _polka: Polka<Request>, private readonly _config: ServerConfig<WebhookEvent>) {}

  public register() {
    // handle issues events
    this._config.webhook.on("issue.opened", this._config.handlers.issues.opened());
    this._config.webhook.on("issue.closed", this._config.handlers.issues.closed());
    this._config.webhook.on("issue.edited", this._config.handlers.issues.edited());
    this._config.webhook.on("issue.reopened", this._config.handlers.issues.reopened());
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

    // attach routes
    this._polka.post(this._config.path, this.verifySignature.bind(this), this.handleWebhook.bind(this));
  }

  private handleWebhook(req: Request, res: Response) {
    const eventName = `${req.body.event}.${req.body.payload.action}` as WebhookEventName;
    const targetId = this._config.groupMapping.findGroupsIn(req.body.payload.repository.html_url);
    // reply back first so github knows we've received it before waiting us handling the response
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ msg: "OK" }));
    this._config.webhook.handle(eventName, req.body.payload, targetId);
  }

  private async verifySignature(req: Request, res: Response, next: NextHandler) {
    const hubSignature = req.headers["x-hub-signature-256"] as string | undefined;
    if (hubSignature === undefined || hubSignature.length === 0) {
      res
        .writeHead(401, { "Content-Type": "application/json" })
        .end(JSON.stringify({ msg: "Signature length is not the same." }));
      return;
    }

    const isEqual = await this._config.webhook.verify(JSON.stringify(req.body), hubSignature);
    if (!isEqual) {
      res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ msg: "Invalid signature" }));
      return;
    }

    next();
  }
}
