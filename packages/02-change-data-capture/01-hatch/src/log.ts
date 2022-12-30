import { createLogger } from '@algar/theia-common'
import { appEnv } from './env/app-env'

export const logger = createLogger('amqp', appEnv.LOG_LEVEL)
