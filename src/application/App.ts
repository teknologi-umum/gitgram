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
import type { ILogger } from "./interfaces/ILogger";
import type { IRoute } from "./interfaces/IRoute";
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
  private readonly _bot: Bot;
  private readonly _logger: ILogger;
  private readonly _httpServer: Polka;
  private readonly _port: number;
  private readonly _routes: IRoute[];

  constructor(config: { port: number; bot: Bot; logger: ILogger; httpServer: Polka; routes: IRoute[] }) {
    if (!(config.bot instanceof Bot)) throw new Error("config.bot is not an instance of grammy bot.");
    if (config.logger === undefined || config.logger === null || typeof config.logger !== "object") {
      throw new Error("config.logger should be an instance implementing ILogger.");
    }
    if (config.port === undefined || config.port === null || typeof config.port !== "number") {
      throw new Error("config.port should be a number.");
    }
    if (config.routes.length === 0) throw new Error("config.servers should contain at least one webhook server");

    this._bot = config.bot;
    this._logger = config.logger;
    this._httpServer = config.httpServer;
    this._port = config.port;
    this._routes = config.routes;
  }

  private registerServers() {
    // register webhook server routes
    this._logger.info("Registering webhook servers");
    for (const server of this._routes) {
      server.register();
    }
    this._logger.info("Webhook servers have been registered");

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

        if (body === undefined || body.length === 0) {
          res
            .writeHead(422, { "Content-Type": "application/json" })
            .end(JSON.stringify({ msg: "Body shouldn't be empty" }));
          return;
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
    this._bot.start({
      onStart: (botInfo) => {
        this.registerServers();
        this._logger.info(`@${botInfo.username} has been started.`);
      }
    });
    this._httpServer.listen(this._port, () => this._logger.info(`Server running on port ${this._port}`));
  }

  public stop() {
    this._bot.stop();
    this._httpServer.server.close();
  }
}
