import { dropExchange } from './_amqp-objects'
import { mgmtEnv } from '../env/mgmt-env'

void Promise.all([
  dropExchange(mgmtEnv, mgmtEnv.AMQP_PUBLISH_EXCHANGE),
  dropExchange(mgmtEnv, mgmtEnv.AMQP_DLX_EXCHANGE),
  dropExchange(mgmtEnv, mgmtEnv.AMQP_WAIT_EXCHANGE),
])
