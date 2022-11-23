import * as envalid from 'envalid'

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface AppEnv {
  NODE_ENV: KnownNodeEnv
  AMQP_PUBLISH_EXCHANGE: string
  AMQP_CONSUME_QUEUE: string
}

const appEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  AMQP_PUBLISH_EXCHANGE: envalid.str(),
  AMQP_CONSUME_QUEUE: envalid.str(),
}

const getAppEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<AppEnv>(env, appEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<AppEnv>
}

const appEnv = getAppEnv(process.env)

export { appEnv, getAppEnv }
export type { AppEnv }
