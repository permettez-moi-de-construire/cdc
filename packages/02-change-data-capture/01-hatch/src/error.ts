import Amqp, {
  AmqpExchange,
  AmqpQueue,
} from '@permettezmoideconstruire/amqp-connector'
import type { Message } from 'amqplib'
import { Duration, milliseconds } from 'date-fns'
import { z } from 'zod'
import { logger } from './log'

const handleError = async (
  amqpErrorQueue: AmqpQueue,
  amqpWaitExchange: AmqpExchange,
  retryDelayDurations: Duration[],
) => {
  const consumeResult = amqpErrorQueue.consumeJson(
    async (msg) => {
      // Retrieve "retries count" from header
      const _xRetries: unknown = msg.properties.headers['x-retries']
      const maybeNumberSchema = z.number().min(0).optional().nullable()
      const parsedXRetries = maybeNumberSchema.safeParse(_xRetries)
      if (!parsedXRetries.success) {
        logger.warn(
          `Ignoring DLX message ${msg.properties.messageId} with invalid x-retries ${_xRetries}`,
        )
        amqpErrorQueue.nack(msg as Message, false, false)
        return
      }
      const xRetries = parsedXRetries.data ?? 0

      // Message reached max retries
      // Time for it to die
      if (xRetries > retryDelayDurations.length - 1) {
        logger.debug(
          `Killing DLX message ${msg.properties.messageId} with max x-retries ${xRetries}`,
        )
        amqpErrorQueue.nack(msg as Message, false, false)
        return
      }

      // Publish it on wait exchange
      logger.log(retryDelayDurations)
      logger.log(xRetries)
      const nextDelay = retryDelayDurations[xRetries]
      logger.log(nextDelay)
      await amqpWaitExchange.sendJson(msg.fields.routingKey, msg.content, {
        ...msg.properties,
        headers: {
          ...msg.properties.headers,
          'x-retries': xRetries + 1,
          'x-delay': milliseconds(nextDelay),
        },
      })

      // And ack it from error
      await amqpErrorQueue.ack(msg as Message)
    },
    { noAck: false },
  )

  logger.info(`Waiting for errors on ${amqpErrorQueue.name}`)

  return consumeResult
}

const handleRequeue = (amqp: Amqp) => async (amqpRequeueQueue: AmqpQueue) => {
  const consumeResult = amqpRequeueQueue.consumeJson(
    async (msg) => {
      // Retreive original queue where message errored
      const _originalQueueName = msg.properties.headers['x-first-death-queue']
      const originalQueue =
        _originalQueueName != null ? amqp.queue(_originalQueueName) : null

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
