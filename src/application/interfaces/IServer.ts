import type { Context } from "grammy";

export interface IServer {
  register(ctx: Context): void;
}
