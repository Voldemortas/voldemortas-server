import * as sass from 'sass'

export default async function buildGlobalScss({
  scssFilePath,
  loadPaths,
  outFileName
}: {
  scssFilePath: string,
  loadPaths?: string[],
  outFileName: string
}) {
  const scss = await Bun.file(`${scssFilePath}`).text()
  const compiledCss = await sass.compileStringAsync(scss, {
    style: 'expanded',
    loadPaths: loadPaths ?? [],
  })
  await Bun.write(outFileName, compiledCss.css)
}
