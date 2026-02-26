import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/handlers/router.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outdir: 'dist/handlers',
  external: ['@aws-sdk/*'],
  sourcemap: true,
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
});

console.log('Build complete: dist/handlers/router.js');
