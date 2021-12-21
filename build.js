const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    external: [
      '@octokit/webhooks',
      'dotenv',
      'rxjs',
      'telegraf',
      'tempura',
    ],
    outdir: '../dist',
    target: ['es2021', 'node16.10'],
    tsconfig: 'tsconfig.json',
  })
  .catch((e) => {
    /* eslint-disable-next-line */
    console.error(e);
    process.exit(1);
  });
