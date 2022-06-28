import type { EventHandlerMapping } from "~/application/App";
import type { IWebhook } from "~/application/webhook/types";

export type ServerConfig = {
  path: string;
  webhook: IWebhook;
  handlers: EventHandlerMapping;
};
