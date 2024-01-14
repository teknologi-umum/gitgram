import type {
  ActionAnswered,
  ActionClosed,
  ActionCreated,
  ActionDeleted,
  ActionEdited,
  ActionPinned,
  ActionReopened
} from "./Actions";
import type {
  BaseEvent,
  DeploymentEventPayload, DiscussionAnsweredEventPayload,
  DiscussionCommentEventPayload,
  DiscussionEventPayload,
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
  // branches
  "branch.created": BaseEvent;
  "branch.deleted": BaseEvent;
  // discussions
  "discussion.created": BaseEvent & ActionCreated & DiscussionEventPayload;
  "discussion.closed": BaseEvent & ActionClosed & DiscussionEventPayload;
  "discussion.reopened": BaseEvent & ActionReopened & DiscussionEventPayload;
  "discussion.edited": BaseEvent & ActionEdited & DiscussionEventPayload;
  "discussion.deleted": BaseEvent & ActionDeleted & DiscussionEventPayload;
  "discussion.answered": BaseEvent & ActionAnswered & DiscussionAnsweredEventPayload;
  "discussion.pinned": BaseEvent & ActionPinned & DiscussionEventPayload;
  // discussion comments
  "discussion_comment.created": BaseEvent & ActionCreated & DiscussionCommentEventPayload;
  // tags
  "tag.created": BaseEvent;
  "tag.deleted": BaseEvent;
  // issues
  "issues.opened": BaseEvent & IssueEventPayload;
  "issues.closed": BaseEvent & IssueEventPayload;
  "issues.reopened": BaseEvent & IssueEventPayload;
  "issues.edited": BaseEvent & IssueEventPayload;
  "issues.updated": BaseEvent & IssueEventPayload;
  // issue comments
  "issue_comment.created": BaseEvent & IssueCommentEventPayload;
  "issue_comment.edited": BaseEvent & IssueCommentEventPayload;
  // pull requests
  "pull_request.opened": BaseEvent & PullRequestEventPayload;
  "pull_request.closed": BaseEvent & PullRequestEventPayload;
  "pull_request.edited": BaseEvent & PullRequestEventPayload;
  "pull_request.reopened": BaseEvent;
  // pull request reviews
  "pull_request_review.submitted": BaseEvent & PullRequestReviewEventPayload;
  "pull_request_review.edited": BaseEvent & PullRequestReviewEventPayload;
  "pull_request_review_comment.created": BaseEvent & PullRequestReviewCommentEventPayload;
  // vulnerabilities
  "repository_vulnerability_alert.create": BaseEvent & VulnerabiliyEventPayload;
  // releases
  "release.published": BaseEvent & ReleaseEventPayload;
  // deployments
  deployment_status: BaseEvent & DeploymentEventPayload;
};

export type WebhookEventName = keyof EventPayload;

export type TEvent<E extends WebhookEventName> = {
  type: E;
  targetsId: bigint[];
  payload: EventPayload[E];
};

export type HandlerFunction<E extends WebhookEventName> = (event: TEvent<E>) => void;

export interface IWebhook<TPayload> {
  secretToken: string;

  sign(payload: string): Promise<string>;

  verify(payload: string, signature: string): Promise<boolean>;

  on<E extends WebhookEventName>(event: E, handler: HandlerFunction<E>): void;

  handle(eventName: WebhookEventName, payload: TPayload, targetsId: bigint[]): Promise<void>;
}