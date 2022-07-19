import { readFile } from "fs/promises";
import path from "path";
import { Bot } from "grammy";
import { parse as parseGura } from "gura";
import polka from "polka";
import { appConfigSchema } from "~/schema";
import { BOT_TOKEN, GITHUB_WEBHOOK_SECRET, PORT } from "~/env";
import { InMemoryGroupMapping } from "~/infrastructure/InMemoryGroupMapping";
import { ConsoleLogger } from "~/infrastructure/ConsoleLogger";
import { App, EventHandlerMapping } from "~/application/App";
import {
  DeploymentEventHandler,
  IssuesEventHandler,
  PullRequestEventHandler,
  ReleaseEventHandler,
  ReviewEventHandler,
  VulnerabilityEventHandler
} from "~/presentation/event-handlers";
import { GithubRoute } from "~/presentation/routes/GithubRoute";
import { GithubWebhook } from "~/application/webhook/GithubWebhook";
import { TelegramPresenter } from "~/presentation/TelegramPresenter";

// configurations
const configFile = await readFile(path.resolve("config", "config.ura"), { encoding: "utf-8" });
const config = appConfigSchema.parse(parseGura(configFile));

// app dependencies
const bot = new Bot(BOT_TOKEN);
const logger = new ConsoleLogger();
const telegramHub = new TelegramPresenter(bot, logger);

// insert group_mapping from configuration
const groupMapping = new InMemoryGroupMapping();
groupMapping.addMultiple(
  config.group_mappings.map((g) => ({
    repositoryUrl: g.repository_url,
    groupId: g.group_id
  }))
);

const eventHandlers: EventHandlerMapping = {
  deployment: new DeploymentEventHandler(config.templates.deployment, telegramHub),
  issues: new IssuesEventHandler(config.templates.issues, telegramHub),
  review: new ReviewEventHandler(config.templates.review, telegramHub),
  pr: new PullRequestEventHandler(config.templates.pr, telegramHub),
  alert: new VulnerabilityEventHandler(config.templates.vulnerability, telegramHub),
  release: new ReleaseEventHandler(config.templates.release, telegramHub)
};

// webhook server and handlers
const polkaInstance = polka();
const githubRoute = new GithubRoute(polkaInstance, {
  path: "/github",
  webhook: new GithubWebhook(GITHUB_WEBHOOK_SECRET),
  handlers: eventHandlers,
  groupMapping: groupMapping
});

// main bot app instance
const app = new App({
  httpServer: polkaInstance,
  port: parseInt(PORT),
  bot,
  logger,
  routes: [githubRoute]
});

app.run();

// Enable graceful shutdown
process.once("SIGINT", () => app.stop());
process.once("SIGTERM", () => app.stop());
