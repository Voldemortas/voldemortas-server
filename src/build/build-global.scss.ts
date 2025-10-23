import * as sass from 'sass'

export default async function buildGlobalScss({
  scssFilePath,
  loadPaths,
  outDir,
  staticDir,
  outFileName = undefined
}: {
  scssFilePath: string,
  loadPaths?: string[],
  outDir: string
  staticDir: string
  outFileName?: string | undefined
}) {
  const scss = await Bun.file(`${scssFilePath}`).text()
  const compiledCss = await sass.compileStringAsync(scss, {
    style: 'expanded',
    loadPaths: loadPaths ?? [],
  })
  let outputPath = outFileName ??
    `${outDir}/${staticDir}/${scssFilePath.replace(/.+\/([^\/]+\.scss)$/, '$1')}`
  await Bun.write(`${outputPath}/global.css`, compiledCss.css)
}
