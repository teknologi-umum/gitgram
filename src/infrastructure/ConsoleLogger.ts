import * as c from "colorette";
import type { ILogger } from "~/application/interfaces/ILogger";

export class ConsoleLogger implements ILogger {
  private readonly _debugPrefix = c.bold(c.blue("[DEBUG] ➤ "));
  private readonly _infoPrefix = c.bold(c.green("[ INFO] ➤ "));
  private readonly _errorPrefix = c.bold(c.red("[ERROR] ➤ "));
  private readonly _warnPrefix = c.bold(c.yellow("[ WARN] ➤ "));

  private getTimestamp() {
    return c.gray(new Date().toLocaleString());
  }

  debug(text: string) {
    // eslint-disable-next-line no-console
    console.info(`${this.getTimestamp()} ${this._debugPrefix} ${text}`);
  }

  info(text: string) {
    // eslint-disable-next-line no-console
    console.info(`${this.getTimestamp()} ${this._infoPrefix} ${text}`);
  }

  error(text: string) {
    // eslint-disable-next-line no-console
    console.error(`${this.getTimestamp()} ${this._errorPrefix} ${text}`);
  }

  warn(text: string) {
    // eslint-disable-next-line no-console
    console.warn(`${this.getTimestamp()} ${this._warnPrefix} ${text}`);
  }
}
