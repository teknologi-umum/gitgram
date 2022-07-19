import { z } from "zod";
import type { IDeploymentEvent } from "~/application/interfaces/events/IDeploymentEvent";
import type { IPresenter } from "~/application/interfaces/IPresenter";
import type { HandlerFunction } from "~/application/webhook/types";
import { interpolate } from "~/utils/interpolate";

export const deploymentTemplateSchema = z.object({
  status: z.object({
    base: z.string(),
    statuses: z.record(z.string())
  })
});

export type DeploymentTemplate = z.infer<typeof deploymentTemplateSchema>;

export class DeploymentEventHandler implements IDeploymentEvent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _templates: DeploymentTemplate, private readonly _hub: IPresenter) {}

  status(): HandlerFunction<"deployment_status"> {
    return (event) => {
      const description = event.payload.deploymentStatus.description;
      const response = interpolate(
        this._templates.status.statuses[event.payload.deploymentStatus.state.toLowerCase()] +
          this._templates.status.base,
        {
          repoName: event.payload.repository.fullName,
          environment: event.payload.deploymentStatus.environment,
          description:
            (description.length > 100 ? description.slice(0, 100) : description) || "No description provided",
          targetUrl: event.payload.deploymentStatus?.targetUrl ?? "No target URL provided"
        }
      );

      this._hub.send({
        event: "deployment_status",
        targetsId: event.targetsId,
        payload: response
      });
    };
  }
}
