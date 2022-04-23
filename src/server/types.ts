import type { IncomingMessage, ServerResponse } from "node:http";
import type { IWebhook } from "../webhook/types";

export type ServerConfig = {
  path: string
  unhandledHandler: (req: IncomingMessage, res: ServerResponse) => void
  webhook: IWebhook
}
