import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebhookEvent } from "@octokit/webhooks-types";
import * as Sentry from "@sentry/node";
import { GithubAdapter } from "../adapters/GithubAdapter";
import type { ILogger } from "../interfaces/ILogger";
import type { HandlerFunction, IWebhook, WebhookEventName } from "./types";
import { IGNORE_PRIVATE_REPOSITORY } from "~/env";

export class GithubWebhook implements IWebhook<WebhookEvent> {
  public readonly secretToken: string;
  private readonly _handlers: Partial<Record<WebhookEventName, HandlerFunction<WebhookEventName>[]>> = {};
  private readonly _logger: ILogger;

  constructor(secretToken: string, logger: ILogger) {
    if (secretToken.length === 0) throw Error("Please provided a proper secret token.");
    this.secretToken = secretToken;
    this._logger = logger;
  }

  public verify(payload: string, signature: string) {
    return Sentry.startSpan({
      name: "verify",
      op: "application.webhook.GithubWebhook"
    }, async () => {
      if (payload.length === 0 || signature.length === 0) throw Error("payload or signature wasn't provided.");
  
      const signatureBuffer = Buffer.from(signature);
      const verificationBuffer = Buffer.from(await this.sign(payload));
  
      if (signatureBuffer.length !== verificationBuffer.length) {
        return false;
      }
  
      return timingSafeEqual(signatureBuffer, verificationBuffer);
    });
  }

  public sign(payload: string): Promise<string> {
    return Sentry.startSpan({
      name: "sign", 
      op: "application.webhook.GithubWebhook"
    }, () => {
      if (payload.length === 0) throw Error("payload wasn't provided.");
      return Promise.resolve(`sha256=${createHmac("sha256", this.secretToken).update(payload).digest("hex")}`);
    });
  }

  public on<E extends WebhookEventName>(event: E, handler: HandlerFunction<E>): void {
    return Sentry.startSpan({
      name: "on",
      op: "application.webhook.GithubWebhook",
      attributes: {
        event: event
      }
    }, () => {
      if (this._handlers[event] === undefined) {
        this._handlers[event] = [];
      }
      this._handlers[event]!.push(handler as HandlerFunction<WebhookEventName>);
    });
  }

  public handle(eventName: WebhookEventName, payload: WebhookEvent, targetsId: bigint[]): Promise<void> {
    return Sentry.startSpan({
      name: "handle",
      op: "application.webhook.GithubWebhook",
      attributes: {
        "event_name": eventName
      }
    }, async () => {
      const handlers = this._handlers[eventName] as HandlerFunction<WebhookEventName>[];
      
      // no handler available
      if (handlers === undefined || handlers.length === 0) {
        this._logger.warn(`No handler available for ${eventName}`);
        return;
      }
  
      // Ignore event from private repository if IGNORE_PRIVATE_REPOSITORY is set to not empty
      if ("repository" in payload && payload.repository !== undefined && payload.repository.private && IGNORE_PRIVATE_REPOSITORY) {
        this._logger.info(`Ignored private repository for ${eventName}`);
        return;
      }
      
      const adapter = new GithubAdapter(payload);
  
      for await (const handler of handlers) {
        handler({ type: eventName, payload: adapter.get(eventName), targetsId: targetsId });
      }
  
      this._logger.info(`Handled: ${eventName} to ${targetsId.join(" ")}`);
    });
  }
}