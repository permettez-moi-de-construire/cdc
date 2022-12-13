import { Amqp, AmqpExchange } from '@permettezmoideconstruire/amqp-connector'
import chalk from 'chalk'
import { PrismaClient } from '@algar/theia-db'
import { z } from 'zod'
import { createEndpoint } from '../util/validated-handler'
import { cancelConsumingQueue } from '../consume'
import { logger } from '../log'

const actions = ['insert', 'update', 'delete'] as const
const actionsEnumSchema = z.enum(actions)

const unsubscribeParamsSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

const unsubscribeResponseSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable(),
    createdAt: z.date(),
    object: z.string(),
    action: actionsEnumSchema,
  })
  .strict()

type UnsubscribeBody = z.infer<typeof unsubscribeParamsSchema>
type UnsubscribeRes = z.infer<typeof unsubscribeResponseSchema>

const unsubscribeHandler = (
  prismaClient: PrismaClient,
  amqpClient: Amqp,
  publishExchange: AmqpExchange,
) =>
  createEndpoint({
    params: unsubscribeParamsSchema,
    res: unsubscribeResponseSchema,
  })(async (req) => {
    const webhook = await prismaClient.$transaction(async (tx) => {
      const webhook = await tx.webhook.delete({
        where: {
          id: req.params.id,
        },
      })
      logger.info(chalk`Unbinding webhook {blue ${webhook.id}}`)

      await cancelConsumingQueue(amqpClient)(publishExchange)(webhook)

      return webhook
    })

    return {
      statusCode: 200,
      body: {
        id: webhook.id,
        name: webhook.name ?? null,
        object: webhook.object,
        action: webhook.action,
        createdAt: webhook.createdAt,
      },
    }
  })

export { unsubscribeHandler, UnsubscribeBody, UnsubscribeRes }
