import * as envalid from 'envalid'

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface CommonEnv {
  NODE_ENV: KnownNodeEnv
  DATABASE_REPL_SLOT_NAME: string
  DATABASE_REPL_PUB_NAME: string
  AMQP_URL: string
  AMQP_PUBLISH_EXCHANGE: string
  AQMP_CONSUME_QUEUE: string
  AQMP_ROUTING_KEY: string
}

const commonEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  DATABASE_REPL_SLOT_NAME: envalid.str(),
  DATABASE_REPL_PUB_NAME: envalid.str(),
  AMQP_URL: envalid.url(),
  AMQP_PUBLISH_EXCHANGE: envalid.str(),
  AQMP_CONSUME_QUEUE: envalid.str(),
  AQMP_ROUTING_KEY: envalid.str(),
}

export { commonEnvValidators }
export type { CleanedEnv, CommonEnv }
