import {beforeAll, afterAll} from 'bun:test';
import Watch from 'src/build/watch.ts';
import routes from 'test/e2e/server/src/routes.ts';
import {
  defaultHtml,
  devHtml,
  entryPoint,
  frontDir,
  tempDir,
  globalScssOptions,
  outDir,
  rootDir,
  srcDir,
  staticDir
} from 'test/e2e/config.ts';

const watcher = new Watch(
  entryPoint,
  rootDir,
  outDir,
  srcDir,
  staticDir,
  frontDir,
  tempDir,
  defaultHtml,
  devHtml,
  globalScssOptions,
  routes,
)

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

beforeAll(async () => {
  console.log('initiating Watcher')
  await watcher.watch()
  await timeout(500)
  console.log('Watcher initiated')
});

afterAll(async () => {
  console.log('exiting Watcher')
  await watcher.kill()
});