import {
  BackRoute,
  ReactRoute,
  Route,
  RedirectRoute,
} from 'voldemortas-server/route'
import currentDate from './back/currentDate.ts'

const routes = [
  new BackRoute('/', (req: Request) => {
    return new Response('labas')
  }),
  new ReactRoute('/h1', 'front/h1.tsx', () => ({
    h1: 'dis is h1',
    text: 'ik ben een tekst',
  })).setPreHeaders({test: 'whatever'}),
  new ReactRoute('/h2', 'front/h1.tsx', {
    h1: 'dis is h1',
    text: 'ik ben een tekst',
  }),
  currentDate,
  new BackRoute('/ping', 'pong'),
  new RedirectRoute('/global.css', '/static/global.css', [
    'headers',
    '{"content-type": "text/css"}',
  ])
    .setPreHeaders({
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-site',
    })
    .setPostHeaders({
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    }),
] as Route[]

export default routes
