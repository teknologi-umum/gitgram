import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    sourcemap: "external",
    bundle: true,
    format: "esm",
    platform: "node",
    external: [
      "cheerio",
      "colorette",
      "dotenv",
      "eventsource",
      "grammy",
      "gura",
      "polka",
      "remark-gfm",
      "remark-html",
      "remark-parse",
      "rxjs",
      "sanitize-html",
      "templite",
      "unified",
      "zod"
    ],
    outdir: "./dist",
    target: ["node18.12"],
    tsconfig: "tsconfig.json"
  })
  .catch((e) => {
    /* eslint-disable-next-line */
    console.error(e);
    process.exit(1);
  });
