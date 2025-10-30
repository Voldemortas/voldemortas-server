import {Route, type RouteType} from 'src/route'

type ParseArgsOptions =
  | {
      delimiter?: string
      isPlain?: false
    }
  | {
      isPlain: true
    }

function getBunEnv(): Bun.Env & NodeJS.ProcessEnv & ImportMetaEnv {
  return Bun.env
}

function parseArgs(
  argName: string,
  options: ParseArgsOptions = {delimiter: '=', isPlain: false}
): string | undefined {
  const regexPattern = !options.isPlain
    ? new RegExp(`${argName}${options.delimiter}(.+)`, 'g')
    : /(?:)/g
  for (let i = 0; i < Bun.argv.length; i++) {
    const arg = Bun.argv[i]
    if (options.isPlain && arg === `--${argName}`) {
      return argName
    }
    const matches = [...arg.matchAll(regexPattern)]
    if (!options.isPlain && matches.length > 0) {
      return matches[0][1]
    }
  }

  return undefined
}

function getConfigVar<T extends string | undefined>(
  name: string,
  defaultValue?: string | T
): string | T {
  return parseArgs(name) ?? getBunEnv()[name] ?? (defaultValue as T)
}

function getConfigVars<T extends {[key: string]: string}>(defaults?: T) {
  const defaultVars = defaults ?? ({} as T)
  const pattern = /^--/
  const argvs = Bun.argv
    .filter((arg) => pattern.test(arg))
    .map((arg) => arg.split('=')[0].slice(2))
  const envs = Object.keys(defaultVars).concat(
    Object.keys(getBunEnv()).concat(argvs)
  )
  return envs.reduce((acc: {[key: string]: string | undefined}, cur) => {
    acc[cur] = getConfigVar(cur, defaultVars[cur])
    return acc
  }, {}) as {[key: string]: string | undefined} & T
}

function getUrl(
  request: Request,
  strictHttp = false
): {
  sub: string
  pathname: string
  href: string
  origin: string
  searchParams: URLSearchParams
} {
  const url = new URL(request.url)
  const sub = url.hostname.split('.')[0]
  const pathname = url.pathname.replace(/\/+$/, '').replaceAll(/^(?:)$/g, '/')
  const href = url.href
  const origin = strictHttp
    ? url.origin.replace(/^http:/, 'https:')
    : url.origin
  const searchParams = url.searchParams

  return {sub, pathname, href, origin, searchParams}
}

function isProd(): boolean {
  return (
    getBunEnv().NODE_ENV === 'production' ||
    getConfigVar('PRODUCTION') === 'true' ||
    !!parseArgs('prod', {isPlain: true})
  )
}

function getPage(
  request: Request,
  resolveType: RouteType,
  conf: Route[]
): Route {
  const {pathname} = getUrl(request)
  return conf.filter(
    ({url, type}) => url === pathname && type === resolveType
  )[0]
}

const textHeaders = {headers: {'content-type': 'text/plain'}}
const jsonHeaders = {headers: {'content-type': 'application/json'}}
const htmlHeaders = {headers: {'content-type': 'text/html'}}

export {
  getBunEnv,
  parseArgs,
  getConfigVar,
  getConfigVars,
  getUrl,
  isProd,
  getPage,
  textHeaders,
  jsonHeaders,
  htmlHeaders,
}
