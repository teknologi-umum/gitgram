import type { EventHandlerMapping } from "~/application/App";
import type { IGroupMapping } from "~/application/interfaces/IGroupMapping";
import type { IWebhook } from "~/application/webhook/types";

export type ServerConfig<TPayload> = {
  path: string;
  webhook: IWebhook<TPayload>;
  handlers: EventHandlerMapping;
  groupMapping: IGroupMapping;
};