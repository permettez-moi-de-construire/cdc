import { createExchange } from './_amqp-objects'
import { mgmtEnv } from '../env/mgmt-env'

void Promise.all([
  createExchange(mgmtEnv, mgmtEnv.AMQP_PUBLISH_EXCHANGE, 'topic'),
  createExchange(mgmtEnv, mgmtEnv.AMQP_DLX_EXCHANGE, 'fanout'),
  createExchange(mgmtEnv, mgmtEnv.AMQP_WAIT_EXCHANGE, 'x-delayed-message', {
    arguments: {
      'x-delayed-type': 'fanout',
    },
  }),
])
