import type { EventHandlerMapping } from "~/application/App";
import type { IGroupMapping } from "~/application/interfaces/IGroupMapping";
import type { IWebhook } from "~/application/webhook/types";

export type ServerConfig = {
  path: string;
  webhook: IWebhook;
  handlers: EventHandlerMapping;
  groupMapping: IGroupMapping;
};
