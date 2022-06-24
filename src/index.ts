import type { IncomingMessage, ServerResponse } from "http";
import { createServer } from "http";
import console from "console";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";
import { Bot, GrammyError, HttpError } from "grammy";
import kleur from "kleur";
import EventSource from "eventsource";
import { deploymentStatus } from "./handlers/deployment";
import {
  issueClosed,
  issueCommentCreated,
  issueOpened,
  issueReopened,
  issueEdited,
  issueCommentEdited
} from "./handlers/issue";
import {
  prClosed,
  prEdited,
  prOpened,
  prReviewCommentCreated,
  prReviewEdited,
  prReviewSubmitted
} from "./handlers/pull_request";
import { release } from "./handlers/release";
import { vulnerabilityAlert } from "./handlers/vulnerability";
import { ping } from "./handlers/ping";
import { GroupMapping } from "./groupMapping";

const groupMapping = new GroupMapping();

const applicationState = {
  isStarted: false,
  startedDate: new Date()
};

const webhook = new Webhooks({
  secret: process.env.WEBHOOK_SECRET ?? ""
});

const bot = new Bot(process.env.BOT_TOKEN ?? "");
bot.catch(async ({ ctx, error }) => {
  const chatId = ctx.chat?.id ?? String(process.env.HOME_GROUP ?? "");
  if (error instanceof GrammyError) {
    await ctx.api.sendMessage(chatId, `Error in request. Reason: ${error}`);
  } else if (error instanceof HttpError) {
    await ctx.api.sendMessage(
      chatId,
      `Couldn't contact telegram. Reason: ${error}`
    );
  } else if (error instanceof Error) {
    await ctx.api.sendMessage(chatId, `Application error. Reason: ${error}`);
  }
});

bot.command("start", async (ctx) => {
  console.log(kleur.green("Telegram bot /start triggered"));

  if (applicationState.isStarted) {
    await ctx.reply(
      `This bot is already running since ${applicationState.startedDate.toLocaleDateString()} To restart it, please stop it first.`
    );
    return;
  }

  console.log(kleur.green("Telegram bot /start triggered"));
  const repositoryUrl = ctx.msg.text.slice(7);
  if (repositoryUrl === "") {
    await ctx.reply(
      "Please provide a repository URL. Example: /start https://github.com/teknologi-umum/bot"
    );
  }

  const started = groupMapping.has(repositoryUrl, ctx.chat.id);

  if (started) {
    await ctx.reply(
      "The bot has already subscribed to the repository. To unsubcribe, use /stop <repository url>"
    );
    return;
  }

  groupMapping.add(repositoryUrl, ctx.chat.id);
  await ctx.api.sendMessage(ctx.chat.id, "I'm alive!");

  // Development purposes
  // See: https://github.com/octokit/webhooks.js#local-development
  if (process.env.NODE_ENV === "development") {
    console.log(kleur.inverse("Running on development EventSource with proxy"));
    const source = new EventSource(process.env.DEV_PROXY_URL ?? "");
    source.onmessage = (event) => {
      const webhookEvent = JSON.parse(event.data);
      webhook
        .verifyAndReceive({
          id: webhookEvent["x-request-id"],
          name: webhookEvent["x-github-event"],
          signature: webhookEvent["x-hub-signature"],
          payload: webhookEvent.body
        })
        .catch(console.error);
    };
  }

  /**
   * For the list of events that can be listened to, go see:
   * https://github.com/octokit/webhooks.js#webhook-events
   *
   * For the Github webhooks documentation link below, please
   * do not open them on different tabs, because they are all
   * resides within one page.
   */

  /**
   * A deployment is created. The type of activity is specified in the action property of the payload object.
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#deployment_status
   * Also see: https://docs.github.com/en/rest/reference/deployments#list-deployment-statuses
   */
  webhook.on("deployment_status", deploymentStatus(ctx));

  /**
   * Activity related to an issue. The type of activity is specified in the action property of the payload object.
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#issues
   * Also see: https://docs.github.com/en/rest/reference/issues#comments
   */
  webhook.on("issues.closed", issueClosed(ctx));
  webhook.on("issues.opened", issueOpened(ctx));
  webhook.on("issues.reopened", issueReopened(ctx));
  webhook.on("issues.edited", issueEdited(ctx));
  webhook.on("issue_comment.created", issueCommentCreated(ctx));
  webhook.on("issue_comment.edited", issueCommentEdited(ctx));

  /**
   * When you create a new webhook, we'll send you a simple ping event to let you know you've set up the webhook correctly.
   * This event isn't stored so it isn't retrievable via the Events API endpoint.
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#ping
   */
  webhook.on("ping", ping(ctx));

  /**
   * Activity related to pull requests. The type of activity is specified in the action property of the payload object.
   * If the action is closed and the merged key is false, the pull request was closed with unmerged commits.
   * If the action is closed and the merged key is true, the pull request was merged.
   *
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request
   * Also see: https://docs.github.com/en/rest/reference/pulls
   */
  webhook.on("pull_request.closed", prClosed(ctx));
  webhook.on("pull_request.opened", prOpened(ctx));
  webhook.on("pull_request.edited", prEdited(ctx));

  /**
   * Activity related to pull request reviews. The type of activity is specified in the action property of the payload object.
   * A pull request review is submitted into a non-pending state.
   *
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request_review
   * Also see: https://docs.github.com/en/rest/reference/pulls#reviews
   */
  webhook.on("pull_request_review.submitted", prReviewSubmitted(ctx));
  webhook.on("pull_request_review.edited", prReviewEdited(ctx));
  webhook.on(
    "pull_request_review_comment.created",
    prReviewCommentCreated(ctx)
  );

  /**
   * a release, pre-release, or draft of a release is published
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#release
   * Also see: https://docs.github.com/en/rest/reference/repos#releases
   */
  webhook.on("release.published", release(ctx));

  /**
   * Activity related to security vulnerability alerts in a repository.
   * The type of activity is specified in the action property of the payload object.
   *
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#repository_vulnerability_alert
   * Also see: https://docs.github.com/en/github/managing-security-vulnerabilities/about-alerts-for-vulnerable-dependencies
   */
  webhook.on("repository_vulnerability_alert.create", vulnerabilityAlert(ctx));
});

const webhookMiddleware = createNodeMiddleware(webhook, {
  path: "/",
  onUnhandledRequest: (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(404).end("Not found");
  },
  log: {
    debug: (data) => console.log(`${kleur.bold().blue("Debug:")} ${data}`),
    info: (data) => console.log(`${kleur.bold().white("Info:")} ${data}`),
    warn: (data) => console.warn(`${kleur.bold().yellow("Warn:")} ${data}`),
    error: (data) => console.error(`${kleur.bold().red("Error:")} ${data}`)
  }
});

const app = createServer(webhookMiddleware);
app.listen(process.env.PORT ?? 3000, () =>
  console.log(
    kleur.green(
      `Server running on http://localhost:${process.env.PORT ?? 3000}`
    )
  )
);
bot.start();

// Enable graceful stop
process.once("SIGINT", () => {
  bot.stop();
  app.close();
});
process.once("SIGTERM", () => {
  bot.stop();
  app.close();
});
