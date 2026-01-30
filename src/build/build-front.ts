import {$} from 'bun'
import * as sass from 'sass'
import {readdir} from 'node:fs/promises'
import {
  getAllModuleScssFiles,
  replaceModuleFileWithDecoratedContent,
} from './build-module.scss.ts'
import {isProd} from 'src/utils'

export default async function buildFront(
  entrypoints: string[],
  tempDir: string,
  outDir: string,
  frontDir: string
) {
  await $`cp ${frontDir} ${tempDir} -r`

  try {
    const isMatchingTsx = (name: string) => /\.tsx$/.test(name)
    const tsxFiles = (await readdir(tempDir, {recursive: true})).filter(
      isMatchingTsx
    )

    const allModuleScssFiles = await getAllModuleScssFiles(tempDir)
    for (const moduleScssFile of allModuleScssFiles) {
      const filePath = `${tempDir}/${moduleScssFile}`
      const escapedFilePath = filePath.replaceAll(
        /\.module\.scss/g,
        '_module.scss'
      )
      const css = await replaceModuleFileWithDecoratedContent(
        filePath,
        escapedFilePath
      )
      const compiledCss = await sass.compileStringAsync(css)
      await Bun.write(
        escapedFilePath.replace(/\.scss$/, '.css'),
        compiledCss.css
      )
      const hash = compiledCss.css.match(
        /^\/\*\s(\w+)\s\*\/\n/
      ) as RegExpExecArray
      await Bun.write(
        escapedFilePath.replace(/\.scss$/, '.js'),
        generateJS(hash[1])
      )
    }
    await Promise.all(
      tsxFiles.map(async (f) => {
        const tsxFile = Bun.file(`${tempDir}/${f}`)
        await Bun.write(
          tsxFile,
          (await tsxFile.text()).replace(
            /import (\w+) from (['"])([.\w\/\-_]+)\.module\.s?css\2/g,
            'import $2$3_module.css$2\nimport $1 from $2$3_module.js$2\n'
          )
        )
      })
    )

    const frontDirName = frontDir.match(/^.+\/([^/]+)\/?$/)!.flat()[1]!
    const uniqueEntryPoints = [...new Set(entrypoints)]
    await Promise.all(
      uniqueEntryPoints.map(async (entryPoint) => {
        const entryPointWithFrontDir = entryPoint.replace(
          new RegExp(`^${frontDirName}/`),
          ''
        )
        const fileName = entryPointWithFrontDir.includes('/')
          ? entryPointWithFrontDir.replace(
              /^(.+)(\/)([^\/]+\.tsx)$/,
              '$1$2__entry__$3'
            )
          : `__entry__${entryPointWithFrontDir}`

        await $`echo ${wrapper(entryPointWithFrontDir)} > ${tempDir}/${fileName}`
        await $`echo ${generateReactJs(fileName)} > ${tempDir}/${entryPointWithFrontDir.replace(/x$/, '')}`
      })
    )
    const buildOutput = await Bun.build({
      entrypoints: uniqueEntryPoints.map(
        (e) =>
          `${tempDir}${e.replace(new RegExp(`^${frontDirName}`), '').replace(/x$/, '')}`
      ),
      outdir: `${outDir}/${frontDirName}`,
      minify: isProd(),
      root: tempDir,
      target: 'browser',
      splitting: false,
    })
    if (!buildOutput.success) {
      console.error(buildOutput.logs)
    }
    const cssPaths = buildOutput.outputs
      .map(({path}) => path)
      .filter((path) => /\.css$/.test(path))
    await fixCssLightDark(cssPaths)
  } catch (e) {
    return Promise.reject(e)
  }

  await $`rm -rf ${tempDir}`
}

async function fixCssLightDark(cssPaths: string[]) {
  await Promise.all(
    cssPaths.map(async (path) => {
      const file = Bun.file(path)
      await Bun.write(
        path,
        (await file.text()).replaceAll(
          /var\(--buncss-light, ([^)]+\)?)\) var\(--buncss-dark, ([^)]+\)?)\)/g,
          'light-dark($1, $2)'
        )
      )
    })
  )
}

function generateJS(hash: string) {
  return `export default function styles(className) {
    const hash = '_${hash}_'
    return hash + className
  }`
}

function wrapper(entryPoint: string) {
  return (
    `import EntryPoint from './` +
    entryPoint.replace(/^.+\/([^\/]+)$/, '$1') +
    `'

export default function Wrapper(params: any) {
  return (
    <>
      <EntryPoint {...params} />
    </>
  )
}
`
  )
}

function generateReactJs(entryPoint: string) {
  return `import {createRoot} from 'react-dom/client'
import Wrapper from './${entryPoint.replace(/^.+\/([^\/]+)$/, '$1')}'

const root = createRoot(document.getElementById('root') as Element)
//@ts-ignore
root.render(Wrapper(globalParams))`
}
