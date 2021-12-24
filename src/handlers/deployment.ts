import type { HandlerFunction } from "@octokit/webhooks/dist-types/types";
import type { Context } from "telegraf";
import templite from "templite";

export function deploymentStatus(
  ctx: Context
): HandlerFunction<"deployment_status", unknown> {
  return async (event) => {
    const STATUS: Record<string, string> = {
      pending: 
        "<b>🚄 Pending deployment for <a href=\"https://github.com/{{repoName}}\">{{repoName}}</a> ({{environment}})</b>",
      success: 
        "<b>🚀 <a href=\"https://github.com/{{repoName}}\">{{repoName}}</a> ({{environment}}) successfully deployed</a></b>",
      failure: 
        "<b>🚧 Failed deploying <a href=\"https://github.com/{{repoName}}\">{{repoName}}</a> ({{environment}})</b>",
      error: 
        "<b>💥 Error deploying <a href=\"https://github.com/{{repoName}}\">{{repoName}}</a> ({{environment}})</b>"
    };
    const template = `\n\n<b>Target URL</b>: {{targetUrl}}
<b>Description</b>: {{description}}`;

    const description = event.payload.deployment_status?.description ?? "";
    const response = templite(
      STATUS[event.payload.deployment_status.state.toLowerCase()] + template, 
      {
        repoName: event.payload.repository.full_name,
        environment: event.payload.deployment_status.environment,
        description: 
          (description.length > 100 ? description.slice(0, 100) : description) ||
          "No description provided",
        targetUrl: event.payload.deployment_status?.target_url ?? "No target URL provided"
      }
    );

    try {
      await ctx.telegram.sendMessage(
        ctx.chat?.id ?? String(process.env.HOME_ID ?? ""),
        response,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    } catch (e) {
      console.error(e);
    }
  };
}
