import { wrap } from 'voldemortas-server'
import routes from 'test/e2e/server/src/routes.ts';
import {defaultHtml, devHtml, entryPoint, frontDir, outDir, rootDir, srcDir, staticDir} from 'test/e2e/config.ts';

await wrap({
  rootDir,
  outDir,
  srcDir,
  entryPoint,
  staticDir,
  frontDir,
  defaultHtml,
  developmentHtml: devHtml,
  routes
})
