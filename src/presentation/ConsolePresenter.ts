import type { IPresenter, MessageData } from "~/application/interfaces/IPresenter";

export class ConsolePresenter implements IPresenter {
  send(data: MessageData): void {
    // only output the resulting message to the console for testing purpose
    // eslint-disable-next-line no-console
    console.log(data.payload);
  }
}