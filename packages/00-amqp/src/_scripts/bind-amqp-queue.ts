import { bindQueue } from './_amqp-objects'
import { mgmtEnv } from '../env/mgmt-env'

void bindQueue(
  mgmtEnv,
  mgmtEnv.AMQP_PUBLISH_EXCHANGE,
  mgmtEnv.AMQP_CONSUME_QUEUE,
  `${mgmtEnv.AMQP_ROUTING_KEY}.*.*`,
)
