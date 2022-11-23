import * as envalid from 'envalid'

const knownNodeEnv = ['development', 'production', 'test'] as const
type KnownNodeEnv = typeof knownNodeEnv[number]

type CleanedEnv<T> = T & envalid.CleanedEnvAccessors

interface MgmtEnv {
  NODE_ENV: KnownNodeEnv
  DATABASE_REPL_SLOT_NAME: string
  DATABASE_REPL_PUB_NAME: string
}

const mgmtEnvValidators = {
  NODE_ENV: envalid.str({ choices: knownNodeEnv }),
  DATABASE_REPL_SLOT_NAME: envalid.str(),
  DATABASE_REPL_PUB_NAME: envalid.str(),
}

const getMgmtEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<MgmtEnv>(env, mgmtEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<MgmtEnv>
}

const mgmtEnv = getMgmtEnv(process.env)

export { mgmtEnv, getMgmtEnv }
export type { MgmtEnv }
