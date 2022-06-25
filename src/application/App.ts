import { Webhooks } from "@octokit/webhooks";
import { Bot, Context, GrammyError, HttpError } from "grammy";
import { DEV, DEV_PROXY_URL, HOME_GROUP } from "../../env";
import type {
  IDeploymentEvent,
  IIssueEvent,
  IPullRequestEvent,
  IReleaseEvent,
  IReviewEvent,
  IVulnerabilityEvent
} from "./interfaces/events";
import type { IGroupMapping } from "./interfaces/IGroupMapping";
import type { ILogger } from "./interfaces/ILogger";

type EventHandlerMapping = {
  deployment: IDeploymentEvent;
  issues: IIssueEvent;
  pr: IPullRequestEvent;
  review: IReviewEvent;
  release: IReleaseEvent;
  alert: IVulnerabilityEvent;
};

export class App {
  private _hasStarted = false;
  private _startedDate = new Date();
  private readonly _supportedProviders = ["github"];
  private readonly _bot: Bot;
  private readonly _webhook: Webhooks;
  private readonly _logger: ILogger;
  private readonly _groupMapping: IGroupMapping;
  private readonly _eventHandlerMapping: EventHandlerMapping;

  constructor(config: {
    bot: Bot;
    webhook: Webhooks;
    logger: ILogger;
    groupMapping: IGroupMapping;
    eventHandlers: EventHandlerMapping;
  }) {
    if (!(config.bot instanceof Bot)) throw new Error("config.bot is not an instance of grammy bot.");
    if (!(config.webhook instanceof Webhooks)) throw new Error("config.webhook is not an instance of octokit webhook.");
    if (config.logger === undefined || config.logger === null || typeof config.logger !== "object") {
      throw new Error("config.logger should be an instance implementing ILogger.");
    }
    if (config.groupMapping === undefined || config.groupMapping === null || typeof config.groupMapping !== "object") {
      throw new Error("config.groupMapping should be an instance implementing IGroupMapping.");
    }
    if (
      config.eventHandlers === undefined ||
      config.eventHandlers === null ||
      typeof config.eventHandlers !== "object"
    ) {
      throw new Error("config.eventHandlers should be provided to handle webhook events.");
    }

    this._bot = config.bot;
    this._webhook = config.webhook;
    this._logger = config.logger;
    this._groupMapping = config.groupMapping;
    this._eventHandlerMapping = config.eventHandlers;
  }

  private addGroupAdditionCommand() {
    this._bot.command("add", async (ctx) => {
      const repositoryUrl = ctx.match;
      if (repositoryUrl === "") {
        await ctx.reply("Please provide a repository URL. Example: /start https://github.com/teknologi-umum/bot");
        return;
      }

      const url = new URL(repositoryUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(
          "Protocol is not supported. Please use <code>http</code> or <code>https</code> as the repository URL protocol."
        );
      }
      if (!this._supportedProviders.includes(url.hostname)) {
        const supported = this._supportedProviders.join(",");
        throw new Error(`${url.hostname} git provider is not supported yet. This bot currently supports ${supported}.`);
      }

      const hasSubscribed = this._groupMapping.has(repositoryUrl, ctx.chat.id);
      if (hasSubscribed) {
        await ctx.reply("The bot has already subscribed to the repository. To unsubcribe, use /stop <repository url>");
        return;
      }

      this._groupMapping.add(repositoryUrl, ctx.chat.id);
    });
  }

  private addOnStartHandler() {
    this._bot.command("start", async (ctx) => {
      this._logger.info("Telegram bot /start triggered");

      if (this._hasStarted) {
        await ctx.reply(
          `This bot is already running since ${this._startedDate.toLocaleDateString()} To restart it, please stop it first.`
        );
        return;
      }

      this._logger.info("Telegram bot /start triggered");
      await ctx.api.sendMessage(ctx.chat.id, "I'm alive!");

      this._hasStarted = true;
      this._startedDate = new Date();

      // Development purposes
      // See: https://github.com/octokit/webhooks.js#local-development
      if (DEV) {
        this._logger.info("Running on development EventSource with proxy");
        const source = new EventSource(DEV_PROXY_URL);
        source.onmessage = (event) => {
          const webhookEvent = JSON.parse(event.data);
          this._webhook
            .verifyAndReceive({
              id: webhookEvent["x-request-id"],
              name: webhookEvent["x-github-event"],
              signature: webhookEvent["x-hub-signature"],
              payload: webhookEvent.body
            })
            .catch(console.error);
        };
      }

      this.handleWebHookEvents(ctx);
    });
  }

  private addErrorHandling() {
    this._bot.catch(async ({ ctx, error }) => {
      const chatId = ctx.chat?.id ?? String(HOME_GROUP);
      if (error instanceof GrammyError) {
        await ctx.api.sendMessage(chatId, `Error in request. Reason: ${error}`);
      } else if (error instanceof HttpError) {
        await ctx.api.sendMessage(chatId, `Couldn't contact telegram. Reason: ${error}`);
      } else if (error instanceof Error) {
        await ctx.api.sendMessage(chatId, `Application error. Reason: ${error}`);
      }
    });
  }

  private handleWebHookEvents(ctx: Context) {
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
    this._webhook.on("deployment_status", this._eventHandlerMapping.deployment.status(ctx));

    /**
     * Activity related to an issue. The type of activity is specified in the action property of the payload object.
     * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#issues
     * Also see: https://docs.github.com/en/rest/reference/issues#comments
     */
    this._webhook.on("issues.closed", this._eventHandlerMapping.issues.closed(ctx));
    this._webhook.on("issues.opened", this._eventHandlerMapping.issues.opened(ctx));
    this._webhook.on("issues.reopened", this._eventHandlerMapping.issues.reopened(ctx));
    this._webhook.on("issues.edited", this._eventHandlerMapping.issues.edited(ctx));
    this._webhook.on("issue_comment.created", this._eventHandlerMapping.issues.commentCreated(ctx));
    this._webhook.on("issue_comment.edited", this._eventHandlerMapping.issues.commentEdited(ctx));

    /**
     * When you create a new webhook, we'll send you a simple ping event to let you know you've set up the webhook correctly.
     * This event isn't stored so it isn't retrievable via the Events API endpoint.
     * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#ping
     */
    this._webhook.on("ping", async (event) => {
      await ctx.api.sendMessage(ctx.chat?.id ?? HOME_GROUP, `You got pinged! ${event.payload.zen}`);
    });

    /**
     * Activity related to pull requests. The type of activity is specified in the action property of the payload object.
     * If the action is closed and the merged key is false, the pull request was closed with unmerged commits.
     * If the action is closed and the merged key is true, the pull request was merged.
     *
     * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request
     * Also see: https://docs.github.com/en/rest/reference/pulls
     */
    this._webhook.on("pull_request.closed", this._eventHandlerMapping.pr.closed(ctx));
    this._webhook.on("pull_request.opened", this._eventHandlerMapping.pr.opened(ctx));
    this._webhook.on("pull_request.edited", this._eventHandlerMapping.pr.edited(ctx));

    /**
     * Activity related to pull request reviews. The type of activity is specified in the action property of the payload object.
     * A pull request review is submitted into a non-pending state.
     *
     * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request_review
     * Also see: https://docs.github.com/en/rest/reference/pulls#reviews
     */
    this._webhook.on("pull_request_review.submitted", this._eventHandlerMapping.review.submitted(ctx));
    this._webhook.on("pull_request_review.edited", this._eventHandlerMapping.review.edited(ctx));
    this._webhook.on("pull_request_review_comment.created", this._eventHandlerMapping.review.created(ctx));

    /**
     * a release, pre-release, or draft of a release is published
     * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#release
     * Also see: https://docs.github.com/en/rest/reference/repos#releases
     */
    this._webhook.on("release.published", this._eventHandlerMapping.release.published(ctx));

    /**
     * Activity related to security vulnerability alerts in a repository.
     * The type of activity is specified in the action property of the payload object.
     *
     * https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#repository_vulnerability_alert
     * Also see: https://docs.github.com/en/github/managing-security-vulnerabilities/about-alerts-for-vulnerable-dependencies
     */
    this._webhook.on("repository_vulnerability_alert.create", this._eventHandlerMapping.alert.created(ctx));
  }

  public run() {
    this.addErrorHandling();
    this.addOnStartHandler();
    this.addGroupAdditionCommand();
    this._bot.start();
  }

  public stop() {
    this._bot.stop();
  }
}
