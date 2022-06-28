import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextHandler, Polka, Request, Response } from "polka";
import type { IServer } from "src/application/interfaces/IServer";
import type { ServerConfig } from "./types";

export class GithubServer implements IServer {
  constructor(private readonly _polka: Polka<Request>, private readonly _config: ServerConfig) {}

  public register() {
    this._polka.use(this.verifySignature.bind(this));
    this._polka.post(this._config.path, this.parsePayload.bind(this));
  }

  private parsePayload(req: Request, res: Response, next: NextHandler) {
    // TODO: implementation
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify("OK"));
  }

  private verifySignature(req: Request, res: Response, next: NextHandler) {
    const hubSignature = req.headers["X-Hub-Signature-256"] as string;

    const hmac = createHmac("sha256", this._config.webhook.secretToken);
    hmac.update(JSON.stringify(req.body));

    const digest = hmac.digest("hex");

    const equal = timingSafeEqual(Buffer.from(hubSignature), Buffer.from("sha256=" + digest));
    if (!equal) {
      res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ msg: "Invalid signature" }));
      return;
    }

    next();
  }
}
