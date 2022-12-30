import { CleanedEnv, knownNodeEnv, KnownNodeEnv } from '@algar/theia-common'
import * as envalid from 'envalid'

interface AppEnv {
  NODE_ENV: KnownNodeEnv
  AMQP_URL: string
  AMQP_CONSUME_QUEUE: string
}

const appEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  AMQP_URL: envalid.url(),
  AMQP_CONSUME_QUEUE: envalid.str(),
}

const getAppEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<AppEnv>(env, appEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<AppEnv>
}

const appEnv = getAppEnv(process.env)

export { appEnv, getAppEnv }
export type { AppEnv }
