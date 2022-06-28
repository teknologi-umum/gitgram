import type { Bot } from "grammy";
import { map, Subject } from "rxjs";
import type { IHub, MessageData } from "~/application/interfaces/IHub";
import type { ILogger } from "~/application/interfaces/ILogger";

export class TelegramHub implements IHub {
  private readonly _messageHub$ = new Subject<[string, number]>();

  constructor(private readonly _bot: Bot, private readonly _logger: ILogger) {
    this._messageHub$
      .pipe(
        map(([message, targetId]) => {
          this._bot.api.sendMessage(targetId, message, {
            parse_mode: "HTML",
            disable_web_page_preview: true
          });
          return targetId;
        })
      )
      .subscribe((targetId) => {
        this._logger.info(`Message has been sent to ${targetId}`);
      });
  }

  send(data: MessageData): void {
    for (const targetId of data.targetsId) {
      this._messageHub$.next([data.payload, targetId]);
    }
  }
}
