import Amqp, {
  AmqpExchange,
  AmqpQueue,
  OnJsonMessageCallback,
} from '@permettezmoideconstruire/amqp-connector'
import { Webhook } from '@algar/theia-db'
import type { Channel, Message, Options, Replies } from 'amqplib'
import _shortUuid from 'short-uuid'
import { appEnv } from './env/app-env'
import { logAmqpEvent, logFullAmqpEvent, logger } from './log'
const shortUuid = _shortUuid()

const createQueue = (amqpClient: Amqp) => async (webhook: Webhook) => {
  const queueId = shortUuid.fromUUID(webhook.id)

  const amqpQueue = amqpClient.defineQueue(queueId, {
    durable: true,
  })
  await amqpQueue.assert()

  return amqpQueue
}

const bindQueue =
  (amqpExchange: AmqpExchange, amqpQueue: AmqpQueue) =>
  async (object: string, action: string) => {
    const routingKey = `${appEnv.AMQP_ROUTING_KEY}.${appEnv.DATABASE_OPERATIONAL_SCHEMA}.${object}.${action}`
    await amqpExchange.bindQueue(amqpQueue, routingKey)

    return routingKey
  }

const consumeQueue =
  (amqpQueue: AmqpQueue) =>
  async (callback: OnJsonMessageCallback, options: Options.Consume) => {
    const reply = (await amqpQueue.consumeJson(async (msg) => {
      try {
        logAmqpEvent(logger.debug)(msg, amqpQueue)
        logFullAmqpEvent(logger.info)(msg)

        await callback(msg)
        await amqpQueue.ack(msg as Message)
      } catch (err: unknown) {
        logger.error(
          `Error handling event ${
            err instanceof Error ? err.message : String(err)
          }`,
        )
        logger.debug(err)
        // TODO: requeue ?
        await amqpQueue.nack(msg as Message, false, false)
      }
    }, options)) as Replies.Consume

    return reply
  }

const createConsumingQueue =
  (amqpClient: Amqp) =>
  (amqpExchange: AmqpExchange) =>
  (webhook: Webhook) =>
  async (
    callback: (webhook: Webhook) => OnJsonMessageCallback,
    options: Options.Consume,
  ) => {
    // Create an AMQP queue
    const amqpQueue = await createQueue(amqpClient)(webhook)

    // Bind it to exchange
    const routingKey = await bindQueue(amqpExchange, amqpQueue)(
      webhook.object,
      webhook.action,
    )

    // Start consuming
    const { consumerTag } = await consumeQueue(amqpQueue)(
      callback(webhook),
      options,
    )

    return {
      amqpQueue,
      consumerTag,
      routingKey,
    }
  }

const cancelConsume = (amqpChannel: Channel) => async (webhook: Webhook) => {
  // Is consuming ?
  if (webhook.consumerTag != null) {
    // Stop consuming
    await amqpChannel.cancel(webhook.consumerTag)
  }
}

const getWebhookQueue = (amqpClient: Amqp) => (webhook: Webhook) => {
  if (webhook.queue == null) {
    // Webhook found but not queue
    // ignore that
    return null
  }

  const amqpQueue = amqpClient.queue(webhook.queue)

  return amqpQueue
}

const unbindQueue =
  (amqpExchange: AmqpExchange, amqpQueue: AmqpQueue) =>
  async (object: string, action: string) => {
    amqpExchange
      ._getChannel()
      .unbindQueue(
        amqpQueue.name,
        amqpExchange.name,
        `${appEnv.AMQP_ROUTING_KEY}.${appEnv.DATABASE_OPERATIONAL_SCHEMA}.${object}.${action}`,
      )
  }

const cancelConsumingQueue =
  (amqpClient: Amqp) =>
  (amqpExchange: AmqpExchange) =>
  async (webhook: Webhook) => {
    const amqpChannel = amqpClient._getChannel()

    await cancelConsume(amqpChannel)(webhook)

    const amqpQueue = getWebhookQueue(amqpClient)(webhook)

    if (amqpQueue == null) {
      // Webhook found but not queue
      // ignore that
      return
    }

    // Unbind queue from channel
    unbindQueue(amqpExchange, amqpQueue)(webhook.object, webhook.action)

    // Delete queue
    await amqpQueue.delete()
  }

export {
  createConsumingQueue,
  cancelConsumingQueue,
  createQueue,
  bindQueue,
  unbindQueue,
  consumeQueue,
  cancelConsume,
  getWebhookQueue,
}
