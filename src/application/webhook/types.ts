export type WebhookProvider = "github" | "gitlab" | "bitbucket";

export type Repository = {
  id: string
  name: string
  owner: string
  description: string
  private: boolean
  git_url: string
  ssh_url: string
  license?: string
  homepage?: string
  language?: string
}

export type Actor = {
  id: string
  name: string
  avatar?: string
}

export type BaseEvent = {
  actor: Actor
  repository: Repository
}

export type PushEventPayload = {
  ref: string
}

export type EventPayload = {
  "push": PushEventPayload & BaseEvent
  "branch.created": BaseEvent
  "branch.deleted": BaseEvent
  "tag.created": BaseEvent
  "tag.deleted": BaseEvent
  "issue.opened": BaseEvent
  "issue.closed": BaseEvent
  "issue.reopened": BaseEvent
  "issue.updated": BaseEvent
  "issue.comment": BaseEvent
  "pull_request.opened": BaseEvent
  "pull_request.closed": BaseEvent
  "pull_request.reopened": BaseEvent
  "pull_request.review.approved": BaseEvent
  "pull_request.review.commented": BaseEvent
  "pull_request.review.request_changes": BaseEvent
  "release.created": BaseEvent
  "release.edited": BaseEvent
  "deployment": BaseEvent
}

export type WebhookEventName = keyof EventPayload

export type TEvent<E extends WebhookEventName> = {
  type: E,
  payload: EventPayload[E]
}


export type HandlerFunction<E extends WebhookEventName> = (event: TEvent<E>) => void

export interface IWebhook {
  secretToken: string;
  provider: WebhookProvider;

  sign(payload: string): Promise<string>
  on<E extends WebhookEventName>(event: E, handler: HandlerFunction<E>): void
}
