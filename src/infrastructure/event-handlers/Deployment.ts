import type { Context } from "grammy";
import templite from "templite";
import { HOME_GROUP } from "~/env";
import type { IDeploymentEvent } from "~/application/interfaces/events/IDeploymentEvent";
import type { HandlerFunction } from "~/application/webhook/types";

export type DeploymentTemplate = {
  status: {
    base: string;
    statuses: Record<string, string>;
  };
};

export class DeploymentEventHandler implements IDeploymentEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: DeploymentTemplate) {}

  status(ctx: Context): HandlerFunction<"deployment_status"> {
    return async (event) => {
      const description = event.payload.deployment_status.description;
      const response = templite(
        this._templates.status.statuses[event.payload.deployment_status.state.toLowerCase()] +
          this._templates.status.base,
        {
          repoName: event.payload.repository.full_name,
          environment: event.payload.deployment_status.environment,
          description:
            (description.length > 100 ? description.slice(0, 100) : description) || "No description provided",
          targetUrl: event.payload.deployment_status?.target_url ?? "No target URL provided"
        }
      );

      try {
        await ctx.api.sendMessage(HOME_GROUP, response, {
          parse_mode: "HTML",
          disable_web_page_preview: true
        });
      } catch (e) {
        // TODO: proper logging
        console.error(e);
      }
    };
  }
}
