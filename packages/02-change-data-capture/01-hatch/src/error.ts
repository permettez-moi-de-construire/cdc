import { getDelayedRepublishOptions, getDlxDeathCount } from '@algar/cdc-amqp'
import Amqp, {
  AmqpExchange,
  AmqpQueue,
} from '@permettezmoideconstruire/amqp-connector'
import type { Message } from 'amqplib'
import { Duration, milliseconds } from 'date-fns'
import { logger } from './log'
import { getDlxOriginalQueue } from './util'

const handleError = async (
  amqpErrorQueue: AmqpQueue,
  amqpWaitExchange: AmqpExchange,
  retryDelayDurations: Duration[],
) => {
  const consumeResult = await amqpErrorQueue.consumeJson(
    async (msg) => {
      // Retreive number of deaths (1 based)
      const dlxDeathsCount = getDlxDeathCount(msg, 'rejected')

      // Apparently it was never rejected
      if (dlxDeathsCount <= 0) {
        logger.warn(
          `Killing DLX message ${msg.properties.messageId} with strange x-death count ${dlxDeathsCount}`,
        )
        amqpErrorQueue.nack(msg as Message, false, false)
        return
      }

      const dlxDeathIndex = dlxDeathsCount - 1

      // Message reached max retries
      // Time for it to die
      if (dlxDeathIndex > retryDelayDurations.length - 1) {
        logger.debug(
          `Killing DLX message ${msg.properties.messageId} with max x-death count ${dlxDeathIndex}`,
        )
        amqpErrorQueue.nack(msg as Message, false, false)
        return
      }

      // Publish it on wait exchange
      const nextDelay = milliseconds(retryDelayDurations[dlxDeathIndex])
      const republishOptions = getDelayedRepublishOptions(msg, nextDelay)
      await amqpWaitExchange.sendJson(
        msg.fields.routingKey,
        msg.content,
        republishOptions,
      )

      // And ack it from error
      await amqpErrorQueue.ack(msg as Message)
    },
    { noAck: false },
  )

  logger.info(`Waiting for errors on ${amqpErrorQueue.name}`)

  return consumeResult
}

const handleRequeue = (amqp: Amqp) => async (amqpRequeueQueue: AmqpQueue) => {
  const consumeResult = await amqpRequeueQueue.consumeJson(
    async (msg) => {
      // Retreive original queue where message errored
      const [originalQueue, _originalQueueName] = getDlxOriginalQueue(amqp)(msg)

      // Original queue not found, kill the message
      if (originalQueue == null) {
        logger.warn(
          `Original queue ${_originalQueueName} not found while requeuing.
          Killing ${msg.properties.messageId}`,
        )
        amqpRequeueQueue.nack(msg as Message, false, false)
        return
      }

      // Requeue message in its original queue
      await originalQueue.sendJson(msg.content, msg.properties)
      amqpRequeueQueue.ack(msg as Message)
    },
    { noAck: false },
  )

  logger.info(`Waiting for requeues on ${amqpRequeueQueue.name}`)

  return consumeResult
}

export { handleError, handleRequeue }
