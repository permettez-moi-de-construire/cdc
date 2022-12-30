import { LogLevel, logLevelValidator } from '@algar/theia-common'
import { Duration } from 'date-fns'
import * as envalid from 'envalid'
import { durationArrayValidator } from './duration-array'

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface MgmtEnv {
  NODE_ENV: KnownNodeEnv
  LOG_LEVEL: LogLevel
  AMQP_URL: string
  AMQP_MGMT_API_URL: string
  AMQP_VHOST: string
  AMQP_PUBLISH_EXCHANGE: string
  AMQP_DLX_EXCHANGE: string
  AMQP_WAIT_EXCHANGE: string
  AMQP_CONSUME_QUEUE: string
  AMQP_ERROR_QUEUE: string
  AMQP_REQUEUE_QUEUE: string
  AMQP_ROUTING_KEY: string
  AMQP_REQUEUE_DELAYS: Duration[]
  DATABASE_OPERATIONAL_SCHEMA: string
}

const mgmtEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  LOG_LEVEL: logLevelValidator(),
  AMQP_URL: envalid.url(),
  AMQP_MGMT_API_URL: envalid.url(),
  AMQP_VHOST: envalid.str(),
  AMQP_PUBLISH_EXCHANGE: envalid.str(),
  AMQP_DLX_EXCHANGE: envalid.str(),
  AMQP_WAIT_EXCHANGE: envalid.str(),
  AMQP_CONSUME_QUEUE: envalid.str(),
  AMQP_ERROR_QUEUE: envalid.str(),
  AMQP_REQUEUE_QUEUE: envalid.str(),
  AMQP_ROUTING_KEY: envalid.str(),
  AMQP_REQUEUE_DELAYS: durationArrayValidator(),
  DATABASE_OPERATIONAL_SCHEMA: envalid.str(),
}

const getMgmtEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<MgmtEnv>(env, mgmtEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<MgmtEnv>
}

const mgmtEnv = getMgmtEnv(process.env)

export { mgmtEnv, getMgmtEnv }
export type { MgmtEnv }
