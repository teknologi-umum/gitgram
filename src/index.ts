import type { IncomingMessage, ServerResponse } from "http";
import { createServer } from "http";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";
import { Bot } from "grammy";
import { LocalGroupMapping } from "./infrastructure/LocalGroupMapping";
import { BOT_TOKEN, PORT, WEBHOOK_SECRET } from "../env";
import { ConsoleLogger } from "./infrastructure/ConsoleLogger";
import { App } from "./application/App";
import {
  DeploymentEventHandler,
  IssuesEventHandler,
  PullRequestEventHandler,
  ReviewEventHandler,
  VulnerabilityEventHandler
} from "./infrastructure/event-handlers";
import { ReleaseEventHandler } from "./infrastructure/event-handlers/Release";

const webhook = new Webhooks({ secret: WEBHOOK_SECRET });
const bot = new Bot(BOT_TOKEN);
const logger = new ConsoleLogger();
const groupMapping = new LocalGroupMapping();

const app = new App(bot, webhook, logger, groupMapping, {
  deployment: new DeploymentEventHandler(),
  issues: new IssuesEventHandler(),
  review: new ReviewEventHandler(),
  pr: new PullRequestEventHandler(),
  alert: new VulnerabilityEventHandler(),
  release: new ReleaseEventHandler()
});

const webhookMiddleware = createNodeMiddleware(webhook, {
  path: "/",
  onUnhandledRequest: (_req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(404).end("Not found");
  },
  log: new ConsoleLogger()
});

const server = createServer(webhookMiddleware);
server.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));
app.run();

// Enable graceful shutdown
process.once("SIGINT", () => {
  app.stop();
  server.close();
});
process.once("SIGTERM", () => {
  app.stop();
  server.close();
});
