export type WebhookProvider = "github" | "gitlab" | "bitbucket";

export type Repository = {
  id: string;
  name: string;
  full_name: string;
  owner: string;
  description: string;
  private: boolean;
  git_url: string;
  ssh_url: string;
  license?: string;
  homepage?: string;
  language?: string;
};

export type Actor = {
  id: string;
  name: string;
  avatar?: string;
};

export type BaseEvent = {
  actor: Actor;
  repository: Repository;
};

// TODO: proper typings
export type Assignee = {
  login: string;
};

// TODO: proper typings
export type User = {
  login: string;
};

// TODO: proper typings
export type Label = {
  name: string;
};

// TODO: proper typings
export type PullRequest = {
  url: string;
  html_url: string;
  title: string;
  number: number;
  user: User;
  merged: boolean;
  body: string;
  assignee: Assignee;
  labels: Label[];
};

// TODO: proper typings
export type Issue = {
  body?: string;
  html_url: string;
  number: number;
  title: string;
  assignee?: Assignee;
  pull_request?: PullRequest;
  user: User;
  labels: Label[];
};

// TODO: proper typings
export type Sender = {
  login: string;
};

// TODO: proper typings
export type Comment = {
  body: string;
  url: string;
  html_url: string;
  user: User;
};

// TODO: proper typings
export type IssueEventPayload = {
  issue: Issue;
  sender: Sender;
};

// TODO: proper typings
export type IssueCommentEventPayload = {
  issue: Issue;
  comment: Comment;
  sender: Sender;
};

export type DeploymentEventPayload = {
  deployment_status: {
    description: string;
    state: string;
    environment: string;
    target_url?: string;
  };
};

export type PullRequestReviewEventPayload = {
  review: {
    body: string;
    state: string;
    html_url: string;
  };
  sender: Sender;
  pull_request: PullRequest;
};

export type PullRequestReviewCommentEventPayload = {
  pull_request: PullRequest;
  comment: Comment;
  sender: Sender;
};

export type PullRequestEventPayload = {
  pull_request: PullRequest;
  sender: Sender;
};

export type VulnerabiliyEventPayload = {
  alert: {
    affected_package_name: string;
    fixed_in: string;
    severity: string;
    external_identifier: string;
    external_reference: string;
  };
};

export type ReleaseEventPayload = {
  release: {
    body: string;
    name: string;
    url: string;
    tag_name: string;
  }
  sender: Sender;
}

export type PushEventPayload = {
  ref: string;
};

export type EventPayload = {
  push: PushEventPayload & BaseEvent;
  "branch.created": BaseEvent;
  "branch.deleted": BaseEvent;
  "tag.created": BaseEvent;
  "tag.deleted": BaseEvent;
  "issue.opened": BaseEvent & IssueEventPayload;
  "issue.closed": BaseEvent & IssueEventPayload;
  "issue.reopened": BaseEvent & IssueEventPayload;
  "issue.edited": BaseEvent & IssueEventPayload;
  "issue.updated": BaseEvent & IssueEventPayload;
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
  payload: EventPayload[E];
};

export type HandlerFunction<E extends WebhookEventName> = (event: TEvent<E>) => void;

export interface IWebhook {
  secretToken: string;
  provider: WebhookProvider;

  sign(payload: string): Promise<string>;
  verify(payload: string, signature: string): Promise<boolean>;
  on<E extends WebhookEventName>(event: E, handler: HandlerFunction<E>): void;
  handle<E extends WebhookEventName>(eventName: WebhookEventName, payload: EventPayload[E]): Promise<void>;
}
