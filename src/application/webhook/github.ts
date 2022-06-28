// Webhook documentation for Github: https://docs.github.com/en/github-ae@latest/developers/webhooks-and-events/webhooks/webhook-events-and-payloads

import { createHmac, timingSafeEqual } from "node:crypto";
import type { HandlerFunction, IWebhook, WebhookEventName } from "./types";

export class GithubWebhook implements IWebhook {
  public readonly provider = "github";
  public readonly secretToken: string;
  private readonly _handlers: Partial<Record<WebhookEventName, HandlerFunction<WebhookEventName>[]>> = {};

  constructor(secretToken: string) {
    if (secretToken.length === 0) throw Error("Please provided a proper secret token.");
    this.secretToken = secretToken;
  }

  public async verify(payload: string, signature: string) {
    if (payload.length === 0 || signature.length === 0) throw Error("payload or signature wasn't provided.");

    const signatureBuffer = Buffer.from(signature);
    const verificationBuffer = Buffer.from(await this.sign(payload));

    if (signatureBuffer.length !== verificationBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, verificationBuffer);
  }

  public sign(payload: string): Promise<string> {
    if (payload.length === 0) throw Error("payload wasn't provided.");
    return Promise.resolve(`sha256=${createHmac("sha256", this.secretToken).update(payload).digest("hex")}`);
  }

  public on<E extends WebhookEventName>(event: E, handler: HandlerFunction<E>): void {
    if (this._handlers[event] === undefined) {
      this._handlers[event] = [];
    }
    this._handlers[event]!.push(handler as HandlerFunction<WebhookEventName>);
  }
}
