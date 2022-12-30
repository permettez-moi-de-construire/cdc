import { LogLevel, logLevelValidator } from '@algar/theia-common'
import { Duration } from 'date-fns'
import * as envalid from 'envalid'
import { durationArrayValidator } from './duration-array'

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface AppEnv {
  NODE_ENV: KnownNodeEnv
  LOG_LEVEL: LogLevel
  AMQP_PUBLISH_EXCHANGE: string
  AMQP_DLX_EXCHANGE: string
  AMQP_WAIT_EXCHANGE: string
  AMQP_CONSUME_QUEUE: string
  AMQP_ERROR_QUEUE: string
  AMQP_REQUEUE_QUEUE: string
  AMQP_REQUEUE_DELAYS: Duration[]
}

const appEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  LOG_LEVEL: logLevelValidator(),
  AMQP_PUBLISH_EXCHANGE: envalid.str(),
  AMQP_DLX_EXCHANGE: envalid.str(),
  AMQP_WAIT_EXCHANGE: envalid.str(),
  AMQP_CONSUME_QUEUE: envalid.str(),
  AMQP_ERROR_QUEUE: envalid.str(),
  AMQP_REQUEUE_QUEUE: envalid.str(),
  AMQP_REQUEUE_DELAYS: durationArrayValidator(),
}

const getAppEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<AppEnv>(env, appEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<AppEnv>
}

const appEnv = getAppEnv(process.env)

export { appEnv, getAppEnv }
export type { AppEnv }
