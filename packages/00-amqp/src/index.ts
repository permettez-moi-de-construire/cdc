import Amqp, {
  AmqpExchangeType,
} from '@permettezmoideconstruire/amqp-connector'
import { appEnv } from './env/app-env'
// import { getRequeueQueueId, getRequeueQueueName } from './requeue'

const amqpClient = new Amqp({
  confirm: true,
})

const amqpExchange = amqpClient.defineExchange(appEnv.AMQP_PUBLISH_EXCHANGE, {
  type: 'topic',
  durable: true,
})

const amqpDlxExchange = amqpClient.defineExchange(appEnv.AMQP_DLX_EXCHANGE, {
  type: 'fanout',
  durable: true,
})

const amqpWaitExchange = amqpClient.defineExchange(appEnv.AMQP_WAIT_EXCHANGE, {
  type: 'x-delayed-message' as AmqpExchangeType,
  durable: true,
  arguments: {
    'x-delayed-type': 'fanout',
  },
})

const amqpQueue = amqpClient.defineQueue(appEnv.AMQP_CONSUME_QUEUE, {
  durable: true,
})

const amqpErrorQueue = amqpClient.defineQueue(appEnv.AMQP_ERROR_QUEUE, {
  durable: true,
})

const amqpRequeueQueue = amqpClient.defineQueue(appEnv.AMQP_REQUEUE_QUEUE, {
  durable: true,
})

// const amqpRequeueDelayQueues = appEnv.AMQP_REQUEUE_DELAYS.map(
//   (requeueDelayDuration) =>
//     amqpClient.defineQueue(getRequeueQueueName(requeueDelayDuration), {
//       queueName: getRequeueQueueId(requeueDelayDuration),
//       durable: true,
//     }),
// )

// const activeAmqpRequeueDelayQueues = [...amqpRequeueDelayQueues.slice(0, 2)]

export {
  amqpClient,
  amqpExchange,
  amqpDlxExchange,
  amqpWaitExchange,
  amqpQueue,
  amqpErrorQueue,
  amqpRequeueQueue,
  // amqpRequeueDelayQueues,
  // activeAmqpRequeueDelayQueues,
}
