import { PrismaClient } from '@algar/theia-db'
import { z } from 'zod'
import { createEndpoint } from '../util/validated-handler'

const actions = ['insert', 'update', 'delete'] as const
const actionsEnumSchema = z.enum(actions)

const listResponseSchema = z.array(
  z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      createdAt: z.date(),
      object: z.string(),
      action: actionsEnumSchema,
    })
    .strict(),
)

type ListRes = z.infer<typeof listResponseSchema>

const listHandler = (prismaClient: PrismaClient) =>
  createEndpoint({
    res: listResponseSchema,
  })(async () => {
    const webhooks = await prismaClient.webhook.findMany()

    return {
      statusCode: 201,
      body: webhooks.map((webhook) => ({
        id: webhook.id,
        name: webhook.name ?? null,
        object: webhook.object,
        action: webhook.action,
        createdAt: webhook.createdAt,
      })),
    }
  })

export { listHandler, ListRes }
