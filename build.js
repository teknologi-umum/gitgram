import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    sourcemap: "external",
    bundle: true,
    format: "esm",
    platform: "node",
    external: [
      "@octokit/webhooks",
      "dotenv",
      "dompurify",
      "eventsource",
      "kleur",
      "remark-gfm",
      "remark-html",
      "remark-parse",
      "rxjs",
      "telegraf",
      "templite",
      "unified"
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
