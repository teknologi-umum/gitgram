import type { NextHandler, Polka, Request, Response } from "polka";
import type { IServer } from "src/application/interfaces/IServer";
import type { ServerConfig } from "./types";

export class GithubServer implements IServer {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _polka: Polka<Request>, private readonly _config: ServerConfig) {}

  public register() {
    this._polka.use(this._config.path, this.verifySignature.bind(this));
    this._polka.post(this._config.path, this.parsePayload.bind(this));
  }

  private parsePayload(req: Request, res: Response) {
    // TODO: implementation
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(req.headers));
  }

  private async verifySignature(req: Request, res: Response, next: NextHandler) {
    const hubSignature = req.headers["X-Hub-Signature-256"] as string;
    const isEqual = await this._config.webhook.verify(JSON.stringify(req.body), hubSignature);

    if (!isEqual) {
      res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ msg: "Invalid signature" }));
      return;
    }

    next();
  }
}
