import { readFile } from "fs/promises";
import path from "path";
import { Bot } from "grammy";
import { parse as parseGura } from "gura";
import polka from "polka";
import { BOT_TOKEN, GITHUB_WEBHOOK_SECRET, PORT } from "~/env";
import { InMemoryGroupMapping } from "~/infrastructure/InMemoryGroupMapping";
import { ConsoleLogger } from "~/infrastructure/ConsoleLogger";
import { App } from "~/application/App";
import {
  DeploymentEventHandler,
  IssuesEventHandler,
  PullRequestEventHandler,
  ReleaseEventHandler,
  ReviewEventHandler,
  VulnerabilityEventHandler
} from "~/infrastructure/event-handlers";
import type { AppConfig } from "~/types";
import { GithubServer } from "~/infrastructure/server/GithubServer";
import { GithubWebhook } from "~/application/webhook/github";

// configurations
const configFile = await readFile(path.resolve("config.gura"), { encoding: "utf-8" });
const config = parseGura(configFile) as AppConfig;

// app dependencies
const bot = new Bot(BOT_TOKEN);
const logger = new ConsoleLogger();
const groupMapping = new InMemoryGroupMapping();
const polkaInstance = polka();

polkaInstance.use(async (req, res, next) => {
  try {
    let body = "";

    for await (const chunk of req) {
      body += chunk;
    }

    switch (req.headers["content-type"]) {
      case "application/x-www-form-urlencoded": {
        const url = new URLSearchParams(body);
        req.body = Object.fromEntries(url.entries());
        break;
      }
      case "application/json":
      default:
        req.body = JSON.parse(body);
    }
    next();
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" }).end(
      JSON.stringify({
        msg: "Invalid body content with the Content-Type header specification"
      })
    );
  }
});

const eventHandlers = {
  deployment: new DeploymentEventHandler(config.templates.deployment),
  issues: new IssuesEventHandler(config.templates.issues),
  review: new ReviewEventHandler(config.templates.review),
  pr: new PullRequestEventHandler(config.templates.pr),
  alert: new VulnerabilityEventHandler(config.templates.vulnerability),
  release: new ReleaseEventHandler(config.templates.release)
};

// webhook server and handlers
const githubServer = new GithubServer(polkaInstance, {
  path: "/github",
  webhook: new GithubWebhook(GITHUB_WEBHOOK_SECRET),
  handlers: eventHandlers
});

// main bot app instance
const app = new App({
  httpServer: polkaInstance,
  port: parseInt(PORT),
  bot,
  logger,
  groupMapping,
  servers: [githubServer]
});

app.run();

// Enable graceful shutdown
process.once("SIGINT", () => app.stop());
process.once("SIGTERM", () => app.stop());
