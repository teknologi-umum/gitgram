export type MessageData = {
  /**
   * Used to distinguish event type so we can distinct-throttle them
   */
  event: string;
  /**
   * The message payload that will be send by the presenter
   */
  payload: string;
  /**
   * The id of the message target
   */
  targetsId: number[]
}

// we might want to support Discord in the future so it's good to have this interface
// instead of just one concrete Telegram presenter implementation
export interface IPresenter {
  send(data: MessageData): void;
}
