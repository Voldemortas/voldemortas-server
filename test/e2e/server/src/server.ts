import Server from 'voldemortas-server'
import routes from './routes'

const server = new Server({
  port: '9900',
  routes: routes,
  staticPaths: [/^\/static\//, /^\/front\//],
}).getServer()

console.log(`Listening on ${server.url}`)
