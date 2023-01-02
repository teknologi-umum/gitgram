import type {
  BaseEvent,
  DeploymentEventPayload,
  IssueCommentEventPayload,
  IssueEventPayload,
  PullRequestEventPayload,
  PullRequestReviewCommentEventPayload,
  PullRequestReviewEventPayload,
  PushEventPayload,
  ReleaseEventPayload,
  VulnerabiliyEventPayload
} from "./Events";

export type EventPayload = {
  push: PushEventPayload & BaseEvent;
  "branch.created": BaseEvent;
  "branch.deleted": BaseEvent;
  "tag.created": BaseEvent;
  "tag.deleted": BaseEvent;
  "issues.opened": BaseEvent & IssueEventPayload;
  "issues.closed": BaseEvent & IssueEventPayload;
  "issues.reopened": BaseEvent & IssueEventPayload;
  "issues.edited": BaseEvent & IssueEventPayload;
  "issues.updated": BaseEvent & IssueEventPayload;
  "issue_comment.created": BaseEvent & IssueCommentEventPayload;
  "issue_comment.edited": BaseEvent & IssueCommentEventPayload;
  "pull_request.opened": BaseEvent & PullRequestEventPayload;
  "pull_request.closed": BaseEvent & PullRequestEventPayload;
  "pull_request.edited": BaseEvent & PullRequestEventPayload;
  "pull_request.reopened": BaseEvent;
  "pull_request_review.submitted": BaseEvent & PullRequestReviewEventPayload;
  "pull_request_review.edited": BaseEvent & PullRequestReviewEventPayload;
  "pull_request_review_comment.created": BaseEvent & PullRequestReviewCommentEventPayload;
  "repository_vulnerability_alert.create": BaseEvent & VulnerabiliyEventPayload;
  "release.published": BaseEvent & ReleaseEventPayload;
  deployment_status: BaseEvent & DeploymentEventPayload;
};

export type WebhookEventName = keyof EventPayload;

export type TEvent<E extends WebhookEventName> = {
  type: E;
  targetsId: BigInt[];
  payload: EventPayload[E];
};

export type HandlerFunction<E extends WebhookEventName> = (event: TEvent<E>) => void;

export interface IWebhook<TPayload> {
  secretToken: string;

  sign(payload: string): Promise<string>;
  verify(payload: string, signature: string): Promise<boolean>;
  on<E extends WebhookEventName>(event: E, handler: HandlerFunction<E>): void;
  handle(eventName: WebhookEventName, payload: TPayload, targetsId: BigInt[]): Promise<void>;
}
