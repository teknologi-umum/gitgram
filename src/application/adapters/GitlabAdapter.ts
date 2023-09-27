import type { WebhookEventName } from "../webhook/types";

// it's a bit free for all with gitlab since they don't have the typescript typings for their webhook events
// they also left some stuff empty so I'll just fill them with unknown values
// see: https://docs.gitlab.com/ee/user/project/integrations/webhook_events.html
export class GitlabAdapter {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(payload: unknown) {
    // TODO: implementation
    throw new Error("Not implemented.");
  }

  get<E extends WebhookEventName>(eventName: E) {
    // TODO: implementation
    throw new Error(`Unhandle event. Event name: ${eventName}`);
  }
}