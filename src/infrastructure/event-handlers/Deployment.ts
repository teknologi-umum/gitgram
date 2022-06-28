import type { IDeploymentEvent } from "~/application/interfaces/events/IDeploymentEvent";
import type { IHub } from "~/application/interfaces/IHub";
import type { HandlerFunction } from "~/application/webhook/types";
import { interpolate } from "~/utils/interpolate";

export type DeploymentTemplate = {
  status: {
    base: string;
    statuses: Record<string, string>;
  };
};

export class DeploymentEventHandler implements IDeploymentEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: DeploymentTemplate, private readonly _hub: IHub) {}

  status(): HandlerFunction<"deployment_status"> {
    return (event) => {
      const description = event.payload.deployment_status.description;
      const response = interpolate(
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

      this._hub.send({
        targetsId: event.targetsId,
        payload: response
      });
    };
  }
}
