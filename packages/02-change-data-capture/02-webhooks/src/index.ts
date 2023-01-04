import { amqpClient, amqpQueue, amqpExchange } from '@algar/cdc-amqp'
import { appEnv } from './env/app-env'
import { PrismaClient } from '@algar/theia-db'
import express from 'express'
import http from 'http'

import { createRouter } from './routes'
import { logAmqpEvent, logFullAmqpEvent, logger } from './log'
import { callWebhook } from './webhook'
import { consumeQueue } from './consume'

const app = express()
const server = http.createServer(app)

const prismaClient = new PrismaClient()

app.use(express.json())

const go = async () => {
  try {
    await Promise.all([
      prismaClient.$connect(),
      amqpClient.connect(appEnv.AMQP_URL),
    ])

    app.use('/webhooks', createRouter(prismaClient, amqpClient, amqpExchange))

    // Consume for monitoring
    await amqpQueue.consumeJson(
      async (msg) => {
        logAmqpEvent(logger.info)(msg, amqpQueue)
        logFullAmqpEvent(logger.debug)(msg)
      },
      { noAck: true },
    )
    logger.info(`Waiting for amqp events on ${amqpQueue.name}`)

    // Consume for each subscribed webhook
    const webhooks = await prismaClient.webhook.findMany()
    for (const webhook of webhooks) {
      // TODO: recreate queue ?
      if (webhook.queue == null) {
        await prismaClient.webhook.delete({ where: { id: webhook.id } })
        continue
      }

      const amqpQueue = amqpClient.defineQueue(webhook.queue, {
        durable: true,
      })
      const { consumerTag } = await consumeQueue(amqpQueue)(
        callWebhook(webhook),
        {
          noAck: false,
        },
      )
      logger.info(`Binding webhook ${webhook.id}`)

      await prismaClient.webhook.update({
        data: {
          consumerTag,
        },
        where: {
          id: webhook.id,
        },
      })
    }

    server.listen(appEnv.PORT, () =>
      logger.info(`Magic happens on port ${appEnv.PORT}`),
    )
    await new Promise((resolve, reject) => {
      server.on('close', resolve)
      server.on('error', reject)
    })
  } finally {
    await Promise.all([
      prismaClient.$disconnect().catch(logger.error),
      amqpClient.disconnect().catch(logger.error),
    ])
  }
}

void go().then().catch(logger.error)
