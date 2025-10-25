import Server from 'voldemortas-server'
import routes from './routes'
import {outDir, devHtml, defaultHtml} from 'test/e2e/config.ts';

console.log({outDir, root: import.meta.dir})

const server = new Server({
  port: '9900',
  routes: routes,
  staticPaths: [/^\/static\//, /^\/front\//],
  outDir,
  developmentHtml: devHtml,
  defaultHtml,
}).getServer()

console.log(`Listening on ${server.url}`)
