import { dropQueue } from './_amqp-objects'
import { mgmtEnv } from '../env/mgmt-env'

void Promise.all([
  dropQueue(mgmtEnv, mgmtEnv.AMQP_CONSUME_QUEUE),
  dropQueue(mgmtEnv, mgmtEnv.AMQP_ERROR_QUEUE),
  dropQueue(mgmtEnv, mgmtEnv.AMQP_REQUEUE_QUEUE),
])
