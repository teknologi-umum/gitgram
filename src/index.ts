import type { IncomingMessage, ServerResponse } from "http";
import { createServer } from "http";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";
import { deploymentStatus } from "./handlers/deployment";
import {
  issueClosed,
  issueCommentCreated,
  issueOpened,
  issueReopened
} from "./handlers/issue";
import {
  prClosed,
  prOpened,
  prReviewComment,
  prReviewSubmitted
} from "./handlers/pull_request";
import { release } from "./handlers/release";
import { vulnerabilityAlert } from "./handlers/vulnerability";
import { Telegraf } from "telegraf";
import kleur from "kleur";
import EventSource from "eventsource";
import { ping } from "./handlers/ping";

const webhook = new Webhooks({
  secret: process.env.WEBHOOK_SECRET ?? ""
});

const bot = new Telegraf(process.env.BOT_TOKEN ?? "");
bot.catch((e) => {
  console.error(e);
});

bot.start((ctx) => {
  console.log(kleur.green("Telegram bot /start triggered"));

  // Development purposes
  // See: https://github.com/octokit/webhooks.js#local-development
  if (process.env.NODE_ENV === "development") {
    console.log(kleur.inverse("Running on development EventSource with proxy"));
    const source = new EventSource(process.env.DEV_PROXY_URL ?? "");
    source.onmessage = async (event) => {
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
  webhook.on("issue_comment.created", issueCommentCreated(ctx));

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

  /**
   * Activity related to pull requests. The type of activity is specified in the action property of the payload object.
   *
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request
   * Also see: https://docs.github.com/en/rest/reference/pulls
   */
  webhook.on("pull_request.opened", prOpened(ctx));

  /**
   * Activity related to pull request reviews. The type of activity is specified in the action property of the payload object.
   * A pull request review is submitted into a non-pending state.
   *
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request_review
   * Also see: https://docs.github.com/en/rest/reference/pulls#reviews
   */
  webhook.on("pull_request_review.submitted", prReviewSubmitted(ctx));

  /**
   * A comment is added to a pull request review
   * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request_review_comment
   * Also see: https://docs.github.com/en/rest/reference/pulls#reviews
   */
  webhook.on("pull_request_review_comment.created", prReviewComment(ctx));

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
    res.writeHead(404, "Not found");
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
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  app.close();
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  app.close();
});
