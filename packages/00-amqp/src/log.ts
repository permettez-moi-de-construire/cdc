import { createLogger } from '@algar/theia-common'
import { mgmtEnv } from './env/mgmt-env'

export const logger = createLogger('amqp', mgmtEnv.LOG_LEVEL)
