import express from 'express'
import { subscribeHandler } from './subscribe'
import { PrismaClient } from '@algar/theia-db'
import Amqp, { AmqpExchange } from '@permettezmoideconstruire/amqp-connector'
import { unsubscribeHandler } from './unsubscribe'
import { listHandler } from './list'

const createRouter = (
  prismaClient: PrismaClient,
  amqpClient: Amqp,
  publishExchange: AmqpExchange,
  errorExchange: AmqpExchange,
) => {
  const router = express.Router()

  router.post(
    '/',
    ...subscribeHandler(
      prismaClient,
      amqpClient,
      publishExchange,
      errorExchange,
    ),
  )
  router.delete(
    '/:id',
    ...unsubscribeHandler(prismaClient, amqpClient, publishExchange),
  )
  router.get('/', ...listHandler(prismaClient))

  return router
}

export { createRouter }
