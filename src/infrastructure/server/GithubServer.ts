import type { NextHandler, Polka, Request, Response } from "polka";
import type { IServer } from "src/application/interfaces/IServer";
import type { Context } from "grammy";
import type { ServerConfig } from "./types";
import type { WebhookEventName } from "~/application/webhook/types";

export class GithubServer implements IServer {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _polka: Polka<Request>, private readonly _config: ServerConfig) {}

  public register(ctx: Context) {
    this._polka.use(this._config.path, this.verifySignature.bind(this));
    this._polka.post(this._config.path, this.handleWebhook.bind(this));

    // handle issues events
    this._config.webhook.on("issue.opened", this._config.handlers.issues.opened(ctx));
    this._config.webhook.on("issue.closed", this._config.handlers.issues.closed(ctx));
    this._config.webhook.on("issue.edited", this._config.handlers.issues.edited(ctx));
    this._config.webhook.on("issue.reopened", this._config.handlers.issues.reopened(ctx));
    this._config.webhook.on("issue_comment.created", this._config.handlers.issues.commentCreated(ctx));
    this._config.webhook.on("issue_comment.edited", this._config.handlers.issues.commentEdited(ctx));

    // handle pull requests events
    this._config.webhook.on("pull_request.opened", this._config.handlers.pr.opened(ctx));
    this._config.webhook.on("pull_request.closed", this._config.handlers.pr.closed(ctx));
    this._config.webhook.on("pull_request.edited", this._config.handlers.pr.edited(ctx));

    // handle reviews events
    this._config.webhook.on("pull_request_review.submitted", this._config.handlers.review.submitted(ctx));
    this._config.webhook.on("pull_request_review_comment.created", this._config.handlers.review.created(ctx));
    this._config.webhook.on("pull_request_review.edited", this._config.handlers.review.edited(ctx));

    // handle release events
    this._config.webhook.on("release.published", this._config.handlers.release.published(ctx));
    this._config.webhook.on("deployment_status", this._config.handlers.deployment.status(ctx));
  }

  private handleWebhook(req: Request, res: Response) {
    const eventName = `${req.body.event}.${req.body.payload.action}` as WebhookEventName;
    this._config.webhook.handle(eventName, req.body.payload);
    // TODO: implementation
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(req.body));
  }

  private async verifySignature(req: Request, res: Response, next: NextHandler) {
    const hubSignature = req.headers["x-hub-signature-256"] as string | undefined;
    if (hubSignature === undefined || hubSignature.length === 0) {
      res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ msg: "Invalid signature" }));
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
