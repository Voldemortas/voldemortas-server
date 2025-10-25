import {$} from 'bun'
import buildFront from './build-front.ts'
import buildBack from './build-back.ts'
import fs from 'node:fs/promises'
import {ReactRoute, type Route} from 'src/route'
import buildGlobalScss from './build-global.scss';

export default async function build({
  outDir,
  defaultHtml,
  developmentHtml = undefined,
  srcDir,
  frontDir,
  staticDir,
  entryPoint,
  rootDir,
  routes,
  globalScssOptions = undefined
}: {
  outDir: string
  srcDir: string
  defaultHtml: string
  developmentHtml?: string
  frontDir: string
  staticDir: string
  entryPoint: string
  rootDir: string
  routes: Route[],
  globalScssOptions?: undefined | { scssFilePath: string, loadPaths?: string[] | undefined, outFileName: string }
}) {
  const TEMP_DIR = (await fs.mkdtemp(rootDir + '/')) + '/'

  console.log({
    outDir,
    defaultHtml,
    developmentHtml,
    srcDir,
    frontDir,
    staticDir,
    entryPoint,
    rootDir,
    globalScssOptions
  })


  log('Starting the build')
  await $`rm -rf ${outDir}`
  await $`mkdir ${outDir}`
  await $`mkdir ${outDir}/status`
  await $`echo \[$(date '+%Y-%m-%d %H:%M:%S.%3N')\] build >> ${outDir}/status/info.txt`
  log('Copying static files')
  await $`cp -r ${srcDir}/${staticDir}/ ${outDir}/${staticDir}/`
  await $`cp ${defaultHtml} ${outDir}/`
  if(developmentHtml !== undefined) {
    await $`cp ${developmentHtml} ${outDir}/`
  }
  if(globalScssOptions !== undefined) {
    log('Building global css')
    await buildGlobalScss(globalScssOptions)
  }
  log('Building frontend')
  const frontPaths = (routes as ReactRoute[])
    .filter((p) => p.type === 'react')
    .map((p) => p.reactPath)
  await buildFront(frontPaths, TEMP_DIR, outDir, frontDir)
  log('Building backend')
  await buildBack(entryPoint, /^\//.test(outDir) ? outDir : rootDir + outDir + '/', srcDir)
  log('Build completed')
}

export function log(...arg: any) {
  console.log(
    `[${new Date().toISOString().split('T')[1].replace('Z', '')}]`,
    ...arg
  )
}
