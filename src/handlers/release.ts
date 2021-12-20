import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";

export const release = (ctx: Context): HandlerFunction<"release.published", unknown> => async (event) => {
  //
}
