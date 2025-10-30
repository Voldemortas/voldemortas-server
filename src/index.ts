import Watch from 'src/build/watch'
import build from 'src/build/builder.ts'
import serve from 'src/build/serve.ts'
import reactRenderImpl from 'src/renderReact'
import {BackRoute, RedirectRoute, type Route} from 'src/route'
import {getConfigVars, getPage, getUrl, isProd, parseArgs} from 'src/utils'

const lastUpdated = new Date().getTime().toString()
const {HASH, PORT, HOSTNAME} = getConfigVars()
const DEFAULT_HTML = import.meta.dir + '/default.html'
const DEV_HTML = import.meta.dir + '/development.html'

export default class Server {
  public readonly port: string | undefined
  public readonly hostname: string | undefined
  public readonly fourOFour: (request: Request) => Response
  public readonly staticPaths: RegExp[]
  public readonly routes: Route[]
  public readonly defaultHtml: string
  public readonly developmentHtml: string
  public readonly outDir: string
  public readonly renderReact: (
    request: Request,
    hash: string,
    routes: Route[],
    defaultHtml: string,
    developmentHtml: string,
    replaceFn?: (htmlContent: string) => string
  ) => Promise<Response>
  private readonly replaceFn: (htmlContent: string) => string
  private server: undefined | Bun.Server<any>

  constructor({
    port = PORT,
    hostname = HOSTNAME,
    fourOFour = () =>
      new Response(null, {status: 404, statusText: 'Not found'}),
    staticPaths = /\B\b/,
    defaultHtml = DEFAULT_HTML,
    developmentHtml = DEV_HTML,
    outDir,
    renderReact = reactRenderImpl,
    replaceFn = (htmlContent: string) => htmlContent,
    routes,
  }: {
    port?: string
    hostname?: string
    fourOFour?: (request: Request) => Response
    staticPaths?: string | RegExp | (RegExp | string)[]
    defaultHtml?: string
    developmentHtml?: string
    outDir: string
    renderReact?: (
      request: Request,
      hash: string,
      routes: Route[],
      defaultHtml: string,
      developmentHtml: string,
      replaceFn?: (htmlContent: string) => string
    ) => Promise<Response>
    replaceFn?: (htmlContent: string) => string
    routes: Route[]
  }) {
    this.port = port
    this.hostname = hostname
    this.fourOFour = fourOFour
    this.staticPaths = [staticPaths].flat().map(Server.makeRegexP)
    this.defaultHtml = defaultHtml
    this.developmentHtml = developmentHtml
    this.outDir = outDir
    this.renderReact = renderReact
    this.replaceFn = replaceFn
    this.routes = routes
  }

  public getServer(): Bun.Server<any> {
    if (this.server !== undefined) {
      return this.server
    }
    const that = this
    const server = Bun.serve({
      port: this.port,
      hostname: this.hostname,
      websocket: {
        async message(ws, message) {},
        async open(ws) {
          ws.send(lastUpdated)
        },
      },
      async fetch(request): Promise<Response | undefined> {
        if (!isProd()) {
          const success = server.upgrade(request)
          if (success) {
            return undefined
          }
        }

        const {pathname} = getUrl(request)
        if (that.staticPaths.filter((path) => path.test(pathname)).length > 0) {
          return await that.serveStatic(request)
        }

        for (const page of that.routes) {
          if (page.url === pathname) {
            if (page.type === 'redirect') {
              return that.serveRedirect(request)
            }
            if (page.type === 'back') {
              return (page as BackRoute).resolver(request, page.params)
            }
            if (page.type === 'react') {
              return that.renderReact(
                request,
                HASH ?? lastUpdated,
                that.routes,
                that.defaultHtml,
                that.developmentHtml,
                that.replaceFn
              )
            }
          }
        }

        return that.fourOFour(request)
      },
    })
    this.server = server
    return this.server
  }

  private static makeRegexP(val: string | RegExp) {
    if (typeof val === 'string') return new RegExp(val)
    return val
  }

  private async serveStatic(
    request: Request,
    staticPath?: string,
    params: string[] = []
  ) {
    const {pathname} = getUrl(request)
    const file = Bun.file(
      `${this.outDir}/${staticPath ?? pathname}`.replaceAll('//', '/')
    )
    if (!(await file.exists())) {
      return this.fourOFour(request)
    }
    const headers = Server.getHeadersForRedirect(
      params,
      Server.getCacheDuration(request)
    )
    return new Response(file, headers)
  }

  private static getHeadersForRedirect(
    params: string[],
    cacheDuration = 0
  ): ResponseInit {
    const cache = {
      'Cache-Control': `max-age=${cacheDuration}`,
    }
    if (params.length === 2) {
      if (params[0] === 'headers' && !!params[1]) {
        return {headers: {...cache, ...JSON.parse(params[1])}}
      }
    }
    return {
      headers: cache,
    }
  }

  private async serveRedirect(request: Request) {
    const page = getPage(request, 'redirect', this.routes) as RedirectRoute
    return await this.serveStatic(request, page.filePath, page.params)
  }

  protected static getCacheDuration(request: Request): number {
    const WEEK = 604800
    const MONTH = 2592000
    const HOUR = 3600
    const {pathname, searchParams} = getUrl(request)
    if (searchParams.get('hash') === HASH) {
      return MONTH
    }
    if (searchParams.get('hash') === lastUpdated) {
      return HOUR
    }
    if (/^\/static\//.test(pathname)) {
      return WEEK
    }
    if (/^\/front\/chunk-/.test(pathname)) {
      return MONTH
    }
    if (pathname === '/favicon.ico') {
      return MONTH
    }
    return 0
  }
}

export async function wrap({
  rootDir,
  srcDir,
  outDir,
  staticDir,
  frontDir,
  tempDir,
  entryPoint,
  defaultHtml,
  developmentHtml,
  globalScssOptions = undefined,
  routes,
  preBuildFn = async () => {},
  postBuildFn = async () => {},
}: {
  rootDir: string
  srcDir: string
  outDir: string
  staticDir: string
  frontDir: string
  tempDir: string
  entryPoint: string
  defaultHtml: string
  developmentHtml: string
  globalScssOptions?:
    | undefined
    | {
        scssFilePath: string
        loadPaths?: string[] | undefined
        outFileName: string
      }
  routes: Route[]
  preBuildFn?: () => Promise<void>
  postBuildFn?: () => Promise<void>
}): Promise<void> {
  if (!!parseArgs('watch', {isPlain: true})) {
    return await new Watch(
      entryPoint,
      rootDir,
      outDir,
      srcDir,
      staticDir,
      frontDir,
      tempDir,
      defaultHtml,
      developmentHtml,
      globalScssOptions,
      routes,
      preBuildFn,
      postBuildFn
    ).watch()
  }
  if (!!parseArgs('build', {isPlain: true})) {
    await build({
      outDir,
      staticDir,
      srcDir,
      rootDir,
      frontDir,
      tempDir,
      entryPoint,
      defaultHtml,
      developmentHtml,
      globalScssOptions,
      routes,
      preBuildFn,
      postBuildFn,
      cleanup: !parseArgs('nocleanup', {isPlain: true}),
    })
  }
  if (!!parseArgs('serve', {isPlain: true})) {
    await serve(entryPoint, isProd())
  }
}
