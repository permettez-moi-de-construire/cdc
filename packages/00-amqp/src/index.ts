import Amqp from '@permettezmoideconstruire/amqp-connector'
import { appEnv } from './env/app-env'

const amqpClient = new Amqp({
  confirm: true,
})

const amqpExchange = amqpClient.defineExchange(appEnv.AMQP_PUBLISH_EXCHANGE, {
  type: 'topic',
  durable: true,
})

const amqpQueue = amqpClient.defineQueue(appEnv.AMQP_CONSUME_QUEUE, {
  durable: true,
})

export { amqpClient, amqpExchange, amqpQueue }
