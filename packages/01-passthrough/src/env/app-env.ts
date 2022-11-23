import * as envalid from 'envalid'

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface AppEnv {
  NODE_ENV: KnownNodeEnv
  DATABASE_REPL_SLOT_NAME: string
  DATABASE_REPL_PUB_NAME: string
  AMQP_URL: string
  AMQP_PUBLISH_EXCHANGE: string
  AMQP_ROUTING_KEY: string
  DATABASE_URL: string
}

const appEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  DATABASE_REPL_SLOT_NAME: envalid.str(),
  DATABASE_REPL_PUB_NAME: envalid.str(),
  AMQP_URL: envalid.url(),
  AMQP_PUBLISH_EXCHANGE: envalid.str(),
  AMQP_ROUTING_KEY: envalid.str(),
  DATABASE_URL: envalid.url(),
}

const getAppEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<AppEnv>(env, appEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<AppEnv>
}

const appEnv = getAppEnv(process.env)

export { appEnv, getAppEnv }
export type { AppEnv }