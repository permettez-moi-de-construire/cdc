import * as envalid from 'envalid'
import { CleanedEnv, CommonEnv, commonEnvValidators } from './common-env'

interface MgmtEnv extends CommonEnv {
  AMQP_MGMT_API_URL: string
  AMQP_VHOST: string
}

const mgmtEnvValidators = {
  ...commonEnvValidators,
  AMQP_MGMT_API_URL: envalid.url(),
  AMQP_VHOST: envalid.str(),
}

const getMgmtEnv = (env: NodeJS.ProcessEnv = process.env) => {
  const cleanedEnv = envalid.cleanEnv<MgmtEnv>(env, mgmtEnvValidators)

  return { ...cleanedEnv } as CleanedEnv<MgmtEnv>
}

const mgmtEnv = getMgmtEnv(process.env)

export { mgmtEnv, getMgmtEnv }
export type { MgmtEnv }
