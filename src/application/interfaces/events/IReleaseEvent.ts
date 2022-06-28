import type { Context } from "grammy";
import type { HandlerFunction } from "~/application/webhook/types";

export interface IReleaseEvent {
  published(ctx: Context): HandlerFunction<"release.published">;
}
