import {$} from 'bun'
import buildFront from './build-front.ts'
import buildBack from './build-back.ts'
import {ReactRoute, type Route} from 'src/route'
import buildGlobalScss from './build-global.scss'

export default async function build({
  outDir,
  defaultHtml,
  developmentHtml = undefined,
  srcDir,
  frontDir,
  staticDir,
  entryPoint,
  rootDir,
  tempDir,
  routes,
  globalScssOptions = undefined,
  preBuildFn = async () => {},
  postBuildFn = async () => {},
  cleanup = true,
}: {
  outDir: string
  srcDir: string
  defaultHtml: string
  developmentHtml?: string
  frontDir: string
  staticDir: string
  entryPoint: string
  rootDir: string
  tempDir: string
  routes: Route[]
  globalScssOptions?:
    | undefined
    | {
        scssFilePath: string
        loadPaths?: string[] | undefined
        outFileName: string
      }
  preBuildFn?: () => Promise<void>
  postBuildFn?: () => Promise<void>
  cleanup?: boolean
}) {
  try {
    log('Starting the build')
    await preBuildFn()
    await $`rm -rf ${outDir}`
    await $`mkdir ${outDir}`
    await $`mkdir ${outDir}/status`
    await $`echo \[$(date '+%Y-%m-%d %H:%M:%S.%3N')\] build >> ${outDir}/status/info.txt`
    log('Copying static files')
    await $`cp -r ${srcDir}/${staticDir}/ ${outDir}/${staticDir}/`
    await $`cp ${defaultHtml} ${outDir}/`
    if (developmentHtml !== undefined) {
      await $`cp ${developmentHtml} ${outDir}/`
    }
    if (globalScssOptions !== undefined) {
      log('Building global css')
      await buildGlobalScss(globalScssOptions)
    }
    log('Building frontend')
    const frontPaths = (routes as ReactRoute[])
      .filter((p) => p.type === 'react')
      .map((p) => p.reactPath)
    if (frontPaths.length > 0) {
      await buildFront(frontPaths, tempDir, outDir, frontDir)
    }
    log('Building backend')
    await buildBack(
      entryPoint,
      /^\//.test(outDir) ? outDir : rootDir + outDir + '/',
      srcDir
    )
    await postBuildFn()
    log('Build completed')
  } catch (e) {
    log(`Build failed:`)
    console.error(e)
  } finally {
    if (cleanup) {
      await $`rm -rf ${tempDir}`
    }
  }
}

export function log(...arg: any) {
  console.log(
    `[${new Date().toISOString().split('T')[1].replace('Z', '')}]`,
    ...arg
  )
}
