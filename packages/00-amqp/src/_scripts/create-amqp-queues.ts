import { createQueue } from './_amqp-objects'
import { mgmtEnv } from '../env/mgmt-env'

void Promise.all([
  createQueue(mgmtEnv, mgmtEnv.AMQP_CONSUME_QUEUE, {
    deadLetterExchange: mgmtEnv.AMQP_DLX_EXCHANGE,
  }),
  createQueue(mgmtEnv, mgmtEnv.AMQP_ERROR_QUEUE),
  createQueue(mgmtEnv, mgmtEnv.AMQP_REQUEUE_QUEUE),
])
