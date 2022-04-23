import polka from "polka";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Polka } from "polka";
import type { ServerConfig } from "./types";

export function githubServer(config: ServerConfig): Polka {
  const routes = polka();

  routes.use(async (req, res, next) => {
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

  routes.use((req, res, next) => {
    const hubSignature = req.headers["X-Hub-Signature-256"] as string;

    const hmac = createHmac("sha256", config.webhook.secretToken);
    hmac.update(JSON.stringify(req.body));

    const digest = hmac.digest("hex");

    const equal = timingSafeEqual(Buffer.from(hubSignature), Buffer.from("sha256=" + digest));
    if (!equal) {
      res.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ msg: "Invalid signature" }));
      return;
    }

    next();
  });

  routes.post(config.path, (_req, _res) => {
    // TODO: do business logic here
  });

  return routes;
}
