import { BackRoute, Route } from 'voldemortas-server/route'
import { jsonHeaders } from 'src/utils';

const route = new BackRoute(
  '/date',
  new Response(JSON.stringify({date: new Date('2020-02-19T23:14:25.989Z').toISOString()}), jsonHeaders)
) as Route

export default route
