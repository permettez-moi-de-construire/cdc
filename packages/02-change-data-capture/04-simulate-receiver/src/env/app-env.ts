import { CleanedEnv, knownNodeEnv, KnownNodeEnv } from '@algar/theia-common'
import * as envalid from 'envalid'

interface AppEnv {
  NODE_ENV: KnownNodeEnv
  RECEIVER_PORT: number
}

const appEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  RECEIVER_PORT: envalid.port(),
}

const getAppEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<AppEnv>(env, appEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<AppEnv>
}

const appEnv = getAppEnv(process.env)

export { appEnv, getAppEnv }
export type { AppEnv }
