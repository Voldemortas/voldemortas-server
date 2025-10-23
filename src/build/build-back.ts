import {isProd} from 'src/utils'
import {$} from 'bun'

export default async function buildBack(
  entryPoint: string,
  outDir: string,
  srcDir: string
) {
  const buildOutput = await Bun.build({
    entrypoints: [entryPoint],
    outdir: outDir,
    root: srcDir,
    target: 'bun',
    minify: isProd(),
    external: ['*.html'],
    env: 'inline',
  })
  if (!buildOutput.success) {
    console.error(buildOutput.logs)
  } else {
    await $`mv ${buildOutput.outputs[0].path} ${outDir}`
  }
}
