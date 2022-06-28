export type MessageData = {
  payload: string;
  targetsId: number[]
}

export interface IHub {
  send(data: MessageData): void;
}
