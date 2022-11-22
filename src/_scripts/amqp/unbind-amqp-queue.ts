import { unbindQueue } from './_amqp-objects'
import { mgmtEnv } from '../../common/env/mgmt-env'

void unbindQueue(
  mgmtEnv,
  mgmtEnv.AMQP_PUBLISH_EXCHANGE,
  mgmtEnv.AQMP_CONSUME_QUEUE,
  mgmtEnv.AQMP_ROUTING_KEY,
)
