import {
  AmqpQueue,
  ConsumeJsonMessage,
} from '@permettezmoideconstruire/amqp-connector'
import type { Message } from 'amqplib'
import { logAmqpEvent, logFullAmqpEvent, logger } from './log'

const callWebhook =
  (amqpQueue: AmqpQueue) => async (msg: ConsumeJsonMessage) => {
    try {
      logAmqpEvent(logger.verbose)(msg, amqpQueue)
      logFullAmqpEvent(logger.debug)(msg)

      await amqpQueue.ack(msg as Message)
    } catch (err: unknown) {
      logger.error(`Error received event`)
      await amqpQueue.nack(msg as Message, false, false)
    }
  }

export { callWebhook }
