import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";

export const deploymentStatus = 
  (ctx: Context): HandlerFunction<"deployment_status", unknown> => 
    async (event) => {
      //
    };
