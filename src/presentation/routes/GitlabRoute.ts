import { Hono, type Context, type Next } from "hono";
import type { ServerConfig } from "./types";
import type { IRoute } from "~/application/interfaces/IRoute";
import type { WebhookEventName } from "~/application/webhook/types";

export class GitlabRoute implements IRoute {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _server: Hono, private readonly _config: ServerConfig<unknown>) {}

  public register() {
    // TODO: register supported events here

    // attach routes
    this._server.use(this._config.path, this.verifySignature.bind(this));
    this._server.post(this._config.path, this.handleWebhook.bind(this));
  }

  private async handleWebhook(c: Context) {
    const requestBody = await c.req.json();
    const eventName = `${requestBody.event}.${requestBody.payload.action}` as WebhookEventName;
    const targetId = this._config.groupMapping.findGroupsIn(requestBody.payload.repository.html_url);
    this._config.webhook.handle(eventName, requestBody.payload, targetId);
    return c.json({ msg: "OK" }, 200);
  }

  private async verifySignature(c: Context, next: Next) {
    const hubSignature = c.req.header("x-gitlab-token");

    if (hubSignature === undefined || hubSignature.length === 0) {
      return c.json({ msg: "Signature length is not the same." }, 401);
    }

    return next();
  }
}