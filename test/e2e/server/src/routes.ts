import { BackRoute, ReactRoute, Route } from 'voldemortas-server/route'
import currentDate from './back/currentDate.ts'

const routes = [
  new BackRoute('/', [], (req: Request) => {
    return new Response('labas')
  }),
  new ReactRoute('/h1', [], 'front/h1.ts', () => ({
    h1: 'dis is h1',
    text: 'ik ben een tekst',
  })),
  currentDate,
] as Route[]

export default routes
