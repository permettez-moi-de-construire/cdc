import {
  CleanedEnv,
  knownNodeEnv,
  KnownNodeEnv,
  LogLevel,
  logLevelValidator,
} from '@algar/theia-common'
import * as envalid from 'envalid'
import { durationArrayValidator } from './duration-array'

interface AppEnv {
  NODE_ENV: KnownNodeEnv
  LOG_LEVEL: LogLevel
  DATABASE_REPL_PGOUTPUT_SLOT_NAME: string
  DATABASE_REPL_WAL2JSON_SLOT_NAME: string
  DATABASE_REPL_PGOUTPUT_PUB_NAME: string
  AMQP_URL: string
  AMQP_PUBLISH_EXCHANGE: string
  AMQP_ROUTING_KEY: string
  AMQP_REQUEUE_DELAYS: Duration[]
  DATABASE_URL: string
}

const appEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  LOG_LEVEL: logLevelValidator(),
  DATABASE_REPL_PGOUTPUT_SLOT_NAME: envalid.str(),
  DATABASE_REPL_WAL2JSON_SLOT_NAME: envalid.str(),
  DATABASE_REPL_PGOUTPUT_PUB_NAME: envalid.str(),
  AMQP_URL: envalid.url(),
  AMQP_PUBLISH_EXCHANGE: envalid.str(),
  AMQP_ROUTING_KEY: envalid.str(),
  AMQP_REQUEUE_DELAYS: durationArrayValidator(),
  DATABASE_URL: envalid.url(),
}

const getAppEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<AppEnv>(env, appEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<AppEnv>
}

const appEnv = getAppEnv(process.env)

export { appEnv, getAppEnv }
export type { AppEnv }
