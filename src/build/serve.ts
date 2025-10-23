import {getConfigVars} from 'src/utils'

export default async function serve(
  entryPoint: string,
  isProd = false,
  bunInterpreter = getConfigVars({BUN_INTERPRETER: 'bun'}).BUN_INTERPRETER
) {
  return Bun.spawn([bunInterpreter, 'run', entryPoint], {
    stdout: 'inherit',
    env: {...getConfigVars(), PRODUCTION: isProd + ''},
  })
}
