import { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import { Context } from "telegraf";

export const ping = 
  (ctx: Context): HandlerFunction<"ping", unknown> => 
  async (event) => {
    await ctx.telegram.sendMessage(
      ctx.chat?.id ?? String(process.env.HOME_ID ?? ""), 
      `You got pinged! ${event.payload.zen}`
    )
}
