import type { Bot } from "grammy";
import { bufferTime, distinctUntilKeyChanged, groupBy, mergeMap, Subject } from "rxjs";
import type { IPresenter, MessageData } from "~/application/interfaces/IPresenter";
import type { ILogger } from "~/application/interfaces/ILogger";

const BUFFER_TIME = 10 * 60 * 1000; // 10 minutes

type SingleMessageData = Omit<MessageData, "targetsId"> & { targetId: BigInt };

export class TelegramPresenter implements IPresenter {
  private readonly _messageHub$ = new Subject<SingleMessageData>();

  constructor(private readonly _bot: Bot, private readonly _logger: ILogger) {
    this._messageHub$
      .pipe(
        // separate each target group
        groupBy((info) => info.targetId),
        mergeMap((group) =>
          group.pipe(
            // prevent duplicate
            distinctUntilKeyChanged("payload"),
            // group burst messages
            bufferTime(BUFFER_TIME)
          )
        )
      )
      .subscribe(async (info) => {
        if (info.length < 1 || info[0] === undefined) return;

        const message = info.map((i) => i.payload).join(`\n${"-".repeat(20)}\n\n`);
        try {
          await this._bot.api.sendMessage(info[0]!.targetId.toString(), message, {
            parse_mode: "HTML",
            disable_web_page_preview: true
          });
        } catch (err: unknown) {
          if (err instanceof Error) {
            this._logger.error(err.message);
          }

          this._logger.error("Unknown error: " + err);
        }
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
