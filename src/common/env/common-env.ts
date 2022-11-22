import * as envalid from 'envalid'

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface CommonEnv {
  NODE_ENV: KnownNodeEnv
  DATABASE_REPL_SLOT_NAME: string
  DATABASE_REPL_PUB_NAME: string
}

const commonEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  DATABASE_REPL_SLOT_NAME: envalid.str(),
  DATABASE_REPL_PUB_NAME: envalid.str(),
}

export { commonEnvValidators }
export type { CleanedEnv, CommonEnv }
