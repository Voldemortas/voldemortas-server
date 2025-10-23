import { BackRoute, Route } from 'voldemortas-server/route'

const route = new BackRoute(
  '/date',
  [],
  () => new Response(new Date('2020-02-19T23:14:25.989Z').toISOString())
) as Route

export default route
