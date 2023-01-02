import { z } from "zod";
import {
  deploymentTemplateSchema,
  issueTemplateSchema,
  pullRequestTemplateSchema,
  releaseTemplateSchema,
  reviewTemplateSchema,
  vulnerabilityTemplateSchema
} from "~/presentation/event-handlers";

export const appConfigSchema = z.object({
  group_mappings: z
    .array(
      z.object({
        repository_url: z.string().trim(),
        group_id: z.bigint({ coerce: true })
      })
    )
    .min(1),
  templates: z.object({
    deployment: deploymentTemplateSchema,
    issues: issueTemplateSchema,
    pr: pullRequestTemplateSchema,
    release: releaseTemplateSchema,
    review: reviewTemplateSchema,
    vulnerability: vulnerabilityTemplateSchema
  })
});
