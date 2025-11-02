import {getPage, htmlHeaders, isProd} from 'src/utils'
import {ReactRoute, Route} from 'src/route'

export default async function renderReact(
  request: Request,
  hash: string,
  routes: Route[],
  defaultHtml: string,
  developmentHtml: string,
  replaceFn: (htmlContent: string) => string = (x) => x
) {
  const htmlFile = await Bun.file(
    defaultHtml.replaceAll(/^\./g, import.meta.dir)
  ).text()

  const page = getPage(request, 'react', routes) as ReactRoute
  const path = page.reactPath.replace(/\.tsx$/, '')
  const devHtmlFile = Bun.file(developmentHtml)
  const devHtml =
    !isProd() && (await devHtmlFile.exists()) ? await devHtmlFile.text() : ''

  const newHtmlFile = htmlFile
    .replace('<script id="dev"></script>', devHtml)
    .replace(
      /([^\S\r\n]+)const hash = undefined\n/,
      isProd() ? '' : `$1const hash = '${hash}'\n`
    )
    .replaceAll(
      'const globalParams = undefined',
      `const globalParams = ${JSON.stringify(page.resolver(request, page.params))}`
    )
    .replaceAll(/placeholderPath.css/g, `${path}.css?hash=${hash}`)
    .replaceAll(/placeholderPath.js/g, `${path}.js?hash=${hash}`)

  return new Response(replaceFn(newHtmlFile), {
    headers: {
      ...page.getPreHeaders(),
      ...htmlHeaders.headers,
      ...page.getPostHeaders(),
    } as HeadersInit,
  })
}
