export type User = {
  name: string;
};

export type Actor = {
  id: string;
  name: string;
  avatar?: string;
};

export type Sender = {
  name: string;
};

export type Comment = {
  body: string;
  url: string;
  user: User;
};

export type Assignee = {
  name: string;
};

export type Label = {
  name: string;
};

export type Deployment = {
  description: string;
  state: string;
  environment: string;
  targetUrl?: string;
};

export type Repository = {
  name: string;
  fullName: string;
  owner: User;
  description: string;
  isPrivate: boolean;
  gitUrl: string;
  sshUrl: string;
  license?: string;
  homepage?: string;
  language?: string;
};

export type PullRequest = {
  url: string;
  title: string;
  number: number;
  user: User;
  isMerged: boolean;
  body: string;
  assignee: Assignee;
  labels: Label[];
};

export type Review = {
  body: string;
  state: string;
  url: string;
};

export type Issue = {
  body: string;
  url: string;
  number: number;
  title: string;
  assignee: Assignee;
  pullRequest?: PullRequest;
  user: User;
  labels: Label[];
};

export type Alert = {
  affectedPackageName: string;
  fixedIn: string;
  severity: string;
  externalIdentifier: string;
  externalReference: string;
};

export type Release = {
  body: string;
  name: string;
  url: string;
  tagName: string;
};
