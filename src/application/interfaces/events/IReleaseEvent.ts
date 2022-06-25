import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "grammy";

export interface IReleaseEvent {
  published(ctx: Context): HandlerFunction<"release.published", unknown>;
}
