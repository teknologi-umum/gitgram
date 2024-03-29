export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";
export const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || WEBHOOK_SECRET;
export const GITLAB_WEBHOOK_SECRET = process.env.GITLAB_WEBHOOK_SECRET || WEBHOOK_SECRET;
export const HOME_GROUP = process.env.HOME_GROUP ?? "";
export const BOT_TOKEN = process.env.BOT_TOKEN ?? "";
export const DEV_PROXY_URL = process.env.DEV_PROXY_URL ?? "";
export const DEV = process.env.NODE_ENV === "development";
export const PROD = process.env.NODE_ENV === "production";
export const PORT = process.env.PORT ?? 3000;
export const IGNORE_PRIVATE_REPOSITORY = process.env?.IGNORE_PRIVATE_REPOSITORY !== "";