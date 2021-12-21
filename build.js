// eslint-disable-next-line @typescript-eslint/no-var-requires
const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    sourcemap: "external",
    bundle: true,
    format: "cjs",
    platform: "node",
    external: [
      "@octokit/webhooks",
      "dotenv",
      "eventsource",
      "kleur",
      "rxjs",
      "telegraf",
      "templite"
    ],
    outdir: "./dist",
    target: ["es2020", "node16.10"],
    tsconfig: "tsconfig.json"
  })
  .catch((e) => {
    /* eslint-disable-next-line */
    console.error(e);
    process.exit(1);
  });
