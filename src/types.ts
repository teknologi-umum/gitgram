import type {
  DeploymentTemplate,
  IssueTemplate,
  PullRequestTemplate,
  ReleaseTemplate,
  ReviewTemplate,
  VulnerabilityTemplate
} from "~/infrastructure/event-handlers";

export interface AppConfig {
  templates: {
    deployment: DeploymentTemplate;
    issues: IssueTemplate;
    pr: PullRequestTemplate;
    release: ReleaseTemplate;
    review: ReviewTemplate;
    vulnerability: VulnerabilityTemplate;
  };
  group_mappings: { repository_url: string; group_id: number }[];
}
