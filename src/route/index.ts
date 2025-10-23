//had problems with const enum :|
export type RouteType = 'react' | 'redirect' | 'back'

export abstract class Route {
  public readonly url: string
  public readonly params: any[]
  public readonly type: RouteType
  protected constructor(url: string, params: any[], type: RouteType) {
    this.url = url
    this.params = params
    this.type = type
  }
}

export class ReactRoute extends Route {
  public readonly reactPath: string
  public readonly resolver: (request: Request, params: any) => any

  public constructor(
    url: string,
    params: any[],
    reactPath: string,
    resolver: (request: Request, params: any) => any
  ) {
    super(url, params, 'react')
    this.reactPath = reactPath
    this.resolver = resolver
  }
}
export class BackRoute extends Route {
  public readonly resolver: (request: Request, params: any) => Response

  public constructor(
    url: string,
    params: any[],
    resolver: (request: Request, params: any) => Response
  ) {
    super(url, params, 'back')
    this.resolver = resolver
  }
}

export class RedirectRoute extends Route {
  public readonly filePath: string
  public constructor(url: string, filePath: string, params: any[] = []) {
    super(url, params, 'redirect')
    this.filePath = filePath
  }
}
