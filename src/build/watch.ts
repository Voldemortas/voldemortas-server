import type {Subprocess} from 'bun'
import {watch, type FSWatcher} from 'node:fs'
import build from './builder'
import type {Route} from 'src/route'
import serve from 'src/build/serve.ts'

export default class Watch {
  private readonly entryPoint: string
  private readonly rootDir: string
  private readonly outDir: string
  private readonly srcDir: string
  private readonly staticDir: string
  private readonly frontDir: string
  private readonly tempDir: string
  private readonly defaultHtml: string
  private readonly developmentHtml: string
  private readonly globalScssOptions:
    | undefined
    | {
        scssFilePath: string
        loadPaths?: string[] | undefined
        outFileName: string
      }
  private readonly routes: Route[]
  private readonly preBuildFn: () => Promise<void>
  private readonly postBuildFn: () => Promise<void>

  private watcher?: FSWatcher
  private server: Subprocess | undefined = undefined
  private isRebuilding = false

  public constructor(
    entryPoint: string,
    rootDir: string,
    outDir: string,
    srcDir: string,
    staticDir: string,
    frontDir: string,
    tempDir: string,
    defaultHtml: string,
    developmentHtml: string,
    globalScssOptions:
      | undefined
      | {
          scssFilePath: string
          loadPaths?: string[] | undefined
          outFileName: string
        },
    routes: Route[],
    preBuildFn = async () => {},
    postBuildFn = async () => {}
  ) {
    this.entryPoint = entryPoint
    this.rootDir = rootDir
    this.outDir = outDir
    this.srcDir = srcDir
    this.staticDir = staticDir
    this.frontDir = frontDir
    this.tempDir = tempDir
    this.defaultHtml = defaultHtml
    this.developmentHtml = developmentHtml
    this.globalScssOptions = globalScssOptions
    this.routes = routes
    this.preBuildFn = preBuildFn
    this.postBuildFn = postBuildFn
  }

  public async kill() {
    if (this.server === undefined) return
    this.server.kill()
    this.watcher!.close()
  }

  public async watch() {
    this.watcher = watch(
      this.srcDir,
      {recursive: true},
      async (event, filename) => {
        if (this.server && !this.isRebuilding) {
          console.log(filename)
          this.isRebuilding = true
          this.server.kill()
          this.server = await this.runServer()
          this.isRebuilding = false
        }
      }
    )

    this.server = await this.runServer()

    process.on('SIGTERM', () => {
      // close watcher when Ctrl-C is pressed
      this.server?.kill()
      this.watcher!.close()
      process.exit(0)
    })
  }

  private async runServer() {
    await build({
      entryPoint: this.entryPoint,
      rootDir: this.rootDir,
      routes: this.routes,
      outDir: this.outDir,
      srcDir: this.srcDir,
      staticDir: this.staticDir,
      frontDir: this.frontDir,
      tempDir: this.tempDir,
      defaultHtml: this.defaultHtml,
      developmentHtml: this.developmentHtml,
      globalScssOptions: this.globalScssOptions,
      preBuildFn: this.preBuildFn,
      postBuildFn: this.postBuildFn,
    })
    return await serve(
      this.entryPoint
        .replace(this.entryPoint.replace(/(.+)\/([^\/]+)$/, '$1'), this.outDir)
        .replace(/\.ts$/, '.js'),
      false
    )
  }
}
