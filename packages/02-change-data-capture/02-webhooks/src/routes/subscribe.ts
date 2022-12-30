import { Amqp, AmqpExchange } from '@permettezmoideconstruire/amqp-connector'
import { PrismaClient } from '@algar/theia-db'
import { z } from 'zod'
import { createEndpoint } from '../util/validated-handler'
import { logDetailledSubscribe, logger } from '../log'
import { createConsumingQueue } from '../consume'
import { callWebhook } from '../webhook'

const actions = ['insert', 'update', 'delete'] as const
const actionsEnumSchema = z.enum(actions)

const subscribeBodySchema = z
  .object({
    name: z.string().optional(),
    url: z.string().url(),
    object: z.string(),
    action: actionsEnumSchema,
  })
  .strict()

const subscribeResponseSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable(),
    createdAt: z.date(),
    object: z.string(),
    action: actionsEnumSchema,
  })
  .strict()

type SubscribeBody = z.infer<typeof subscribeBodySchema>
type SubscribeRes = z.infer<typeof subscribeResponseSchema>

const subscribeHandler = (
  prismaClient: PrismaClient,
  amqpClient: Amqp,
  publishExchange: AmqpExchange,
) =>
  createEndpoint({
    body: subscribeBodySchema,
    res: subscribeResponseSchema,
  })(async (req) => {
    const webhook = await prismaClient.$transaction(async (tx) => {
      let webhook = await tx.webhook.create({
        data: req.body,
      })
      logger.info(`Binding webhook ${webhook.id}`)

      // Create an AMQP queue
      const { amqpQueue, consumerTag, routingKey } = await createConsumingQueue(
        amqpClient,
      )(publishExchange)(webhook)(callWebhook, { noAck: false })

      logDetailledSubscribe(logger.debug)(
        routingKey,
        consumerTag,
        amqpQueue,
        webhook,
      )

      webhook = await tx.webhook.update({
        data: {
          queue: amqpQueue.name,
          consumerTag: consumerTag,
        },
        where: {
          id: webhook.id,
        },
      })

      return webhook
    })

    return {
      statusCode: 201,
      body: {
        id: webhook.id,
        name: webhook.name ?? null,
        object: webhook.object,
        action: webhook.action,
        createdAt: webhook.createdAt,
      },
    }
  })

export { subscribeHandler, SubscribeBody, SubscribeRes }
