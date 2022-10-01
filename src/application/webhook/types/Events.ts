import type { Deployment, Issue, PullRequest, Repository, Sender, Comment, Review, Alert, Release, CommentChanges } from "./Entity";

export type BaseEvent = {
  repository: Repository;
};

export type IssueEventPayload = {
  issue: Issue;
  sender: Sender;
};

export type IssueCommentEventPayload = {
  issue: Issue;
  comment: Comment;
  changes?: CommentChanges;
  sender: Sender;
};

export type DeploymentEventPayload = {
  deploymentStatus: Deployment;
};

export type PullRequestReviewEventPayload = {
  review: Review;
  sender: Sender;
  pullRequest: PullRequest;
};

export type PullRequestReviewCommentEventPayload = {
  pullRequest: PullRequest;
  comment: Comment;
  sender: Sender;
};

export type PullRequestEventPayload = {
  pullRequest: PullRequest;
  sender: Sender;
};

export type VulnerabiliyEventPayload = {
  alert: Alert;
};

export type ReleaseEventPayload = {
  release: Release;
  sender: Sender;
};

export type PushEventPayload = {
  ref: string;
};
