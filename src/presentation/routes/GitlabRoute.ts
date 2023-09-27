import type { Polka, Request, Response } from "polka";
import type { ServerConfig } from "./types";
import type { IRoute } from "~/application/interfaces/IRoute";
import type { WebhookEventName } from "~/application/webhook/types";

export class GitlabRoute implements IRoute {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _polka: Polka<Request>, private readonly _config: ServerConfig<unknown>) {}

  public register() {
    // TODO: register supported events here

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

  private verifySignature(req: Request, res: Response) {
    const hubSignature = req.headers["x-gitlab-token"] as string | undefined;

    if (hubSignature === undefined || hubSignature.length === 0) {
      res
        .writeHead(401, { "Content-Type": "application/json" })
        .end(JSON.stringify({ msg: "Signature length is not the same." }));
      return;
    }

    // TODO: implementation
    throw new Error("Not implemented");
  }
}