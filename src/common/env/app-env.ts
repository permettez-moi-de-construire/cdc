import * as envalid from 'envalid'
import { CleanedEnv, CommonEnv, commonEnvValidators } from './common-env'

interface AppEnv extends CommonEnv {
  PORT: number
  DATABASE_URL: string
  AMQP_URL: string
}

const appEnvValidators = {
  ...commonEnvValidators,
  PORT: envalid.port(),
  DATABASE_URL: envalid.url(),
  AMQP_URL: envalid.url(),
}

const getAppEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<AppEnv>(env, appEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<AppEnv>
}

const appEnv = getAppEnv(process.env)

export { appEnv, getAppEnv }
export type { AppEnv }
