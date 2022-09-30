import { Bot, HttpError } from "grammy";
import { groupBy, mergeMap, retry, Subject, throttleTime } from "rxjs";
import type { IPresenter, MessageData } from "~/application/interfaces/IPresenter";
import type { ILogger } from "~/application/interfaces/ILogger";

type SingleMessageData = Omit<MessageData, "targetsId"> & { targetId: number };

export class TelegramPresenter implements IPresenter {
  private readonly _messageHub$ = new Subject<SingleMessageData>();

  constructor(private readonly _bot: Bot, private readonly _logger: ILogger) {
    this._messageHub$
      .pipe(
        // throttle each event type individually
        groupBy((info) => info.event),
        mergeMap((grouped) => grouped.pipe(throttleTime(1000))),
        // we can only send 1 message / second for each targetId, this is a limitation from telegram API
        groupBy((info) => info.targetId),
        mergeMap((grouped) => grouped.pipe(throttleTime(1000))),
        // send 'em
        mergeMap(({ targetId, payload }) => {
          return this._bot.api.sendMessage(targetId, payload, {
            parse_mode: "HTML",
            disable_web_page_preview: true
          });
        }),
        // retry based on `retry_after` that telegram gave us just in case we broke our rate limiter
        retry({
          count: 2,
          delay: (error) => {
            if (error instanceof HttpError) {
              // @ts-ignore 
              // I'm too lazy to type this one out but trust me 
              // this is correct according to telegram documentation
              // - elianiva
              return error.error?.response.data.parameters.retry_after;
            }
            return null;
          }
        })
      )
      .subscribe((targetId) => {
        this._logger.info(`Message has been sent to ${targetId.chat.id}`);
      });
  }

  send(data: MessageData): void {
    for (const targetId of data.targetsId) {
      this._messageHub$.next({
        event: data.event,
        payload: data.payload,
        targetId: targetId
      });
    }
  }
}
