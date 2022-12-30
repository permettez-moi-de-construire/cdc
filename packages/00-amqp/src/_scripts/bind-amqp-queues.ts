import { bindQueue } from './_amqp-objects'
import { mgmtEnv } from '../env/mgmt-env'

void Promise.all([
  bindQueue(
    mgmtEnv,
    mgmtEnv.AMQP_PUBLISH_EXCHANGE,
    mgmtEnv.AMQP_CONSUME_QUEUE,
    `${mgmtEnv.AMQP_ROUTING_KEY}.${mgmtEnv.DATABASE_OPERATIONAL_SCHEMA}.*.*`,
  ),
  bindQueue(mgmtEnv, mgmtEnv.AMQP_DLX_EXCHANGE, mgmtEnv.AMQP_ERROR_QUEUE, '#'),
  bindQueue(
    mgmtEnv,
    mgmtEnv.AMQP_WAIT_EXCHANGE,
    mgmtEnv.AMQP_REQUEUE_QUEUE,
    '#',
  ),
])
