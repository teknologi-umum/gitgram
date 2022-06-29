export type MessageData = {
  payload: string;
  targetsId: number[]
}

// we might want to support Discord in the future so it's good to have this interface
// instead of just one concrete Telegram presenter implementation
export interface IPresenter {
  send(data: MessageData): void;
}
