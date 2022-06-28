declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";

      HOME_GROUP: string;
      WEBHOOK_SECRET: string;
      BOT_TOKEN: string;
      DEV_PROXY_URL: string;
      PORT: string;
    }
  }
}

export {};
