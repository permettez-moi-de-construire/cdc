import * as envalid from 'envalid'

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface MgmtEnv {
  NODE_ENV: KnownNodeEnv
  AMQP_URL: string
  AMQP_MGMT_API_URL: string
  AMQP_VHOST: string
  AMQP_PUBLISH_EXCHANGE: string
  AMQP_CONSUME_QUEUE: string
  AMQP_ROUTING_KEY: string
  DATABASE_OPERATIONAL_SCHEMA: string
}

const mgmtEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  AMQP_URL: envalid.url(),
  AMQP_MGMT_API_URL: envalid.url(),
  AMQP_VHOST: envalid.str(),
  AMQP_PUBLISH_EXCHANGE: envalid.str(),
  AMQP_CONSUME_QUEUE: envalid.str(),
  AMQP_ROUTING_KEY: envalid.str(),
  DATABASE_OPERATIONAL_SCHEMA: envalid.str(),
}

const getMgmtEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<MgmtEnv>(env, mgmtEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<MgmtEnv>
}

const mgmtEnv = getMgmtEnv(process.env)

export { mgmtEnv, getMgmtEnv }
export type { MgmtEnv }
