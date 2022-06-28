import { Bot, GrammyError, HttpError } from "grammy";
import type { Polka } from "polka";
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
import type { IServer } from "./interfaces/IServer";
import { HOME_GROUP } from "~/env";

export type EventHandlerMapping = {
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
  private readonly _logger: ILogger;
  private readonly _groupMapping: IGroupMapping;
  private readonly _httpServer: Polka;
  private readonly _port: number;
  private readonly _servers: IServer[];

  constructor(config: {
    port: number;
    bot: Bot;
    logger: ILogger;
    groupMapping: IGroupMapping;
    httpServer: Polka;
    servers: IServer[];
  }) {
    if (!(config.bot instanceof Bot)) throw new Error("config.bot is not an instance of grammy bot.");
    if (config.logger === undefined || config.logger === null || typeof config.logger !== "object") {
      throw new Error("config.logger should be an instance implementing ILogger.");
    }
    if (config.groupMapping === undefined || config.groupMapping === null || typeof config.groupMapping !== "object") {
      throw new Error("config.groupMapping should be an instance implementing IGroupMapping.");
    }
    if (config.port === undefined || config.port === null || typeof config.port !== "number") {
      throw new Error("config.port should be a number.");
    }
    if (config.servers.length === 0) throw new Error("config.servers should contain at least one webhook server");

    this._bot = config.bot;
    this._logger = config.logger;
    this._groupMapping = config.groupMapping;
    this._httpServer = config.httpServer;
    this._port = config.port;
    this._servers = config.servers;
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
      // if (DEV) {
      //   this._logger.info("Running on development EventSource with proxy");
      //   const source = new EventSource(DEV_PROXY_URL);
      //   source.onmessage = (event) => {
      //     const webhookEvent = JSON.parse(event.data);
      //     this._webhook
      //       .verifyAndReceive({
      //         id: webhookEvent["x-request-id"],
      //         name: webhookEvent["x-github-event"],
      //         signature: webhookEvent["x-hub-signature"],
      //         payload: webhookEvent.body
      //       })
      //       // TODO: proper logging
      //       .catch(console.error);
      //   };
      // }

      // register webhook server routes
      for (const server of this._servers) {
        server.register(ctx);
      }
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

  private addJsonParser() {
    this._httpServer.use(async (req, res, next) => {
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
  }

  public run() {
    this.addErrorHandling();
    this.addJsonParser();
    this.addGroupAdditionCommand();
    this.addOnStartHandler();
    this._bot.start({
      onStart: (botInfo) => this._logger.info(`Bot ${botInfo.username} has been started.`)
    });
    this._httpServer.listen(this._port, () => this._logger.info(`Server running on port ${this._port}`));
  }

  public stop() {
    this._bot.stop();
    this._httpServer.server.close();
  }
}
