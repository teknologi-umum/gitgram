type WebhookProvider = "github" | "gitlab" | "bitbucket";

type Repository = {
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

type Actor = {
  id: string
  name: string
  avatar?: string
}

type BaseEvent = {
  actor: Actor
  repository: Repository
}

type PushEventPayload = {
  ref: string
}

type EventPayload = {
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

type WebhookEventName = keyof EventPayload

type TEvent<E extends WebhookEventName> = {
  type: E,
  payload: EventPayload[E]
}


type HandlerFunction<E extends WebhookEventName> = (event: TEvent<E>) => void

export interface IWebhook {
  secretToken: string;
  provider: WebhookProvider;

  sign(payload: string): Promise<string>
  on<E extends WebhookEventName>(event: E, handler: HandlerFunction<E>): void
}
