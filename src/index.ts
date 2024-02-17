import { readFile } from "fs/promises";
import path from "path";
import { Bot } from "grammy";
import { parse as parseGura } from "gura";
import { Hono } from "hono";
import { otelTracer } from "./utils/honoOtelTracer";
import { appConfigSchema } from "~/schema";
import { BOT_TOKEN, GITHUB_WEBHOOK_SECRET, PORT, HOME_GROUP } from "~/env";
import { InMemoryGroupMapping } from "~/infrastructure/InMemoryGroupMapping";
import { ConsoleLogger } from "~/infrastructure/ConsoleLogger";
import { App, type EventHandlerMapping } from "~/application/App";
import {
  DeploymentEventHandler,
  IssuesEventHandler,
  PullRequestEventHandler,
  ReleaseEventHandler,
  ReviewEventHandler,
  VulnerabilityEventHandler,
  DiscussionEventHandler
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
const defaultGroups: bigint[] | undefined = HOME_GROUP !== ""
  ? HOME_GROUP.split(",").map((n) => BigInt(n))
  : undefined;
const groupMapping = new InMemoryGroupMapping(defaultGroups);
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
  release: new ReleaseEventHandler(config.templates.release, telegramHub),
  discussion: new DiscussionEventHandler(config.templates.discussion, telegramHub)
};

// webhook server and handlers
const serverInstance = new Hono();
serverInstance.get("/", (c) => c.text("OK"));
serverInstance.use("*", otelTracer("gitgram"));
const githubRoute = new GithubRoute(serverInstance, {
  path: "/github",
  webhook: new GithubWebhook(GITHUB_WEBHOOK_SECRET, logger),
  handlers: eventHandlers,
  groupMapping: groupMapping
});

// main bot app instances
const app = new App({
  hono: serverInstance,
  port: parseInt(PORT),
  bot,
  logger,
  routes: [githubRoute]
});

// Enable graceful shutdown
process.once("SIGINT", () => app.stop());
process.once("SIGTERM", () => app.stop());

app.run();