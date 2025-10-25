import { wrap } from 'voldemortas-server'
import routes from 'test/e2e/server/src/routes.ts';
import {
  defaultHtml,
  devHtml,
  entryPoint,
  frontDir,
  globalScssOptions,
  outDir,
  rootDir,
  srcDir,
  staticDir,
  tempDir,
} from 'test/e2e/config.ts';

await wrap({
  rootDir,
  outDir,
  srcDir,
  entryPoint,
  staticDir,
  frontDir,
  tempDir,
  defaultHtml,
  developmentHtml: devHtml,
  globalScssOptions,
  routes
})
