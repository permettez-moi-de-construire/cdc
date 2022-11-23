import { createExchange } from './_amqp-objects'
import { mgmtEnv } from '../env/mgmt-env'

void createExchange(mgmtEnv, mgmtEnv.AMQP_PUBLISH_EXCHANGE, 'topic')
