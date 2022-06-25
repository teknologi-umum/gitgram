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
  ReleaseEventHandler,
  ReviewEventHandler,
  VulnerabilityEventHandler
} from "./infrastructure/event-handlers";
import { parse as parseGura } from "gura";
import { readFile } from "fs/promises";
import path from "path";
import type { AppConfig } from "./types";

const configFile = await readFile(path.resolve(__dirname, "config.gura"), { encoding: "utf-8" });
const config = parseGura(configFile) as AppConfig;

const webhook = new Webhooks({ secret: WEBHOOK_SECRET });
const bot = new Bot(BOT_TOKEN);
const logger = new ConsoleLogger();
const groupMapping = new LocalGroupMapping();

const app = new App({
  bot,
  webhook,
  logger,
  groupMapping,
  eventHandlers: {
    deployment: new DeploymentEventHandler(config.templates.deployment),
    issues: new IssuesEventHandler(config.templates.issues),
    review: new ReviewEventHandler(config.templates.review),
    pr: new PullRequestEventHandler(config.templates.pr),
    alert: new VulnerabilityEventHandler(config.templates.vulnerability),
    release: new ReleaseEventHandler(config.templates.release)
  }
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
