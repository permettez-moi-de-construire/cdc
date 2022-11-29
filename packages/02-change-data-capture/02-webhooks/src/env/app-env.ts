import * as envalid from 'envalid'

const logLevels = [
  'error',
  'warn',
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
] as const

type LogLevel = typeof logLevels[number]

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface AppEnv {
  NODE_ENV: KnownNodeEnv
  WEBHOOKS_PORT: number
  WEBHOOKS_DATABASE_URL: string
  AMQP_URL: string
  AMQP_CONSUME_QUEUE: string
  AMQP_PUBLISH_EXCHANGE: string
  AMQP_ROUTING_KEY: string
  LOG_LEVEL: LogLevel
}

const appEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  WEBHOOKS_PORT: envalid.port(),
  WEBHOOKS_DATABASE_URL: envalid.url(),
  AMQP_URL: envalid.url(),
  AMQP_CONSUME_QUEUE: envalid.str(),
  AMQP_PUBLISH_EXCHANGE: envalid.str(),
  AMQP_ROUTING_KEY: envalid.str(),
  LOG_LEVEL: envalid.str({ choices: logLevels }),
}

const getAppEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<AppEnv>(env, appEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<AppEnv>
}

const appEnv = getAppEnv(process.env)

export { appEnv, getAppEnv }
export type { AppEnv }
