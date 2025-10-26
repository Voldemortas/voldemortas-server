import { BackRoute, ReactRoute, Route, RedirectRoute } from 'voldemortas-server/route'
import currentDate from './back/currentDate.ts'

const routes = [
  new BackRoute('/', (req: Request) => {
    return new Response('labas')
  }),
  new ReactRoute('/h1', 'front/h1.ts', () => ({
    h1: 'dis is h1',
    text: 'ik ben een tekst',
  })),
  new ReactRoute('/h2', 'front/h1.ts', {
    h1: 'dis is h1',
    text: 'ik ben een tekst',
  }),
  currentDate,
  new BackRoute('/ping', 'pong'),
  new RedirectRoute('/global.css', '/static/global.css', [
    'headers',
    '{"content-type": "text/css"}',
  ]),
] as Route[]

export default routes
