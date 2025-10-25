const metaDir = import.meta.dir
//TODO find a way to organise this better
export const rootDir = metaDir + (metaDir.includes('/out') ? '/../' : '/server/')
export const outDir = rootDir + 'out'
export const srcDir = rootDir + 'src'
export const entryPoint = srcDir + '/server.ts'
export const staticDir = 'static'
export const frontDir = srcDir + '/front/'
export const defaultHtml = srcDir + '/default.html'
export const devHtml = srcDir + '/development.html'
export const globalScssOptions = {
  scssFilePath: `${srcDir}/global.scss`,
  outFileName: `${outDir}/${staticDir}/global.css`,
}