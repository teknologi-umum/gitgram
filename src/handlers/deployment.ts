import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";
import templite from "templite";

export const deploymentStatus = 
  (ctx: Context): HandlerFunction<"deployment_status", unknown> => 
    async (event) => {
      const template = `♻️ Deployment Status:
        <b>Repo Name: </b> <a href="https://github.com/{{repoName}}">{{repoName}}</a>
        <b>Status: </b> {{status}}
        <b>Target URL: </b> {{targetUrl}}
        <b>Description: </b> {{description}}`;

      const response = templite(template, {
        repoName: event.payload.repository.full_name,
        status: event.payload.deployment_status.state,
        description: event.payload.deployment_status?.description ?? "",
        targetUrl: event.payload.deployment_status?.target_url ?? ""
      });
      
      await ctx.telegram.sendMessage(
        ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
        response,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    };
