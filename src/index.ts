import { Webhooks } from "@octokit/webhooks";
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
import polka from "polka";
import { GithubServer } from "./infrastructure/server/GithubServer";
import { GithubWebhook } from "./application/webhook/github";

// configurations
const configFile = await readFile(path.resolve(__dirname, "config.gura"), { encoding: "utf-8" });
const config = parseGura(configFile) as AppConfig;

// app dependencies
const webhook = new Webhooks({ secret: WEBHOOK_SECRET });
const bot = new Bot(BOT_TOKEN);
const logger = new ConsoleLogger();
const groupMapping = new LocalGroupMapping();
const polkaInstance = polka();

// main bot app instance
const app = new App({
  httpServer: polkaInstance,
  port: parseInt(PORT),
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

// webhook server and handlers
const githubServer = new GithubServer(polkaInstance, {
  path: "/github",
  webhook: new GithubWebhook("strong secret goes here")
});

app.addServers([githubServer]);
app.run();

// Enable graceful shutdown
process.once("SIGINT", () => app.stop());
process.once("SIGTERM", () => app.stop());
