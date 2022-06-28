import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    sourcemap: "external",
    bundle: true,
    format: "esm",
    platform: "node",
    external: [
      "polka",
      "dotenv",
      "eventsource",
      "colorette",
      "remark-gfm",
      "remark-html",
      "remark-parse",
      "rxjs",
      "sanitize-html",
      "grammy",
      "templite",
      "unified"
    ],
    outdir: "./dist",
    target: ["node16.15"],
    tsconfig: "tsconfig.json"
  })
  .catch((e) => {
    /* eslint-disable-next-line */
    console.error(e);
    process.exit(1);
  });
