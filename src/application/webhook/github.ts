// Webhook documentation for Github: https://docs.github.com/en/github-ae@latest/developers/webhooks-and-events/webhooks/webhook-events-and-payloads

import type { HandlerFunction, IWebhook, WebhookEventName } from "./types";

export class GithubWebhook implements IWebhook {
  public readonly provider = "github";

  constructor(public readonly secretToken: string) {}

  public sign(payload: string): Promise<string> {
    return Promise.resolve("a");
  }

  public on<E extends WebhookEventName>(event: E, handler: HandlerFunction<E>): void {}
}
