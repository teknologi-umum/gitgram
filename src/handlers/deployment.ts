import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";
import templite from "templite";

export const deploymentStatus = 
  (ctx: Context): HandlerFunction<"deployment_status", unknown> => 
    async (event) => {
      const template = `♻️ Deployment Status
        <b>Status</b> {{status}}
      `;

      const response = templite(template, {
        status: event.payload.deployment_status.state
      });
      
      ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
      response,
      { parse_mode: "HTML", disable_web_page_preview: true };
    };
