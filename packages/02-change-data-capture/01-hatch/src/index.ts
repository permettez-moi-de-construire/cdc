import chalk from 'chalk'
import { amqpClient, amqpExchange } from '@algar/cdc-amqp'
import { Wal2Json } from 'pg-logical-replication'
import { appEnv } from './env/app-env'
import { v4 as uuid } from 'uuid'

import {
  listeningService,
  Wal2JsonMessageV2,
  wal2JsonPlugin,
} from './repl-log-service'
import { objectifyMessageV2 } from './message'

const go = async () => {
  try {
    await amqpClient.connect(appEnv.AMQP_URL)

    listeningService.on('data', async (lsn: string, msg: Wal2Json.Output) => {
      try {
        const eventId = uuid()
        const messageObject = objectifyMessageV2(
          msg as unknown as Wal2JsonMessageV2,
          eventId,
        )
        const messageType = `${messageObject.table}.${messageObject.operation}`
        const key = `${appEnv.AMQP_ROUTING_KEY}.${messageType}`

        await amqpExchange.sendJson(key, messageObject, {
          type: messageType,
          contentType: 'application/json',
          messageId: eventId,
          timestamp: messageObject.occuredAt.getTime(),
        })

        console.log(chalk`Forwarded {bold ${key}} event [{blue ${lsn}}]`)
        console.log(chalk`=> to [{blue ${eventId}}]`)
      } catch (err: unknown) {
        console.error(chalk`Error forwarding event {red ${lsn}}`)
        console.error(err)
        console.debug(msg)
      }
    })

    listeningService.on('start', () => {
      console.log(
        chalk`Waiting for wal2json logs on {blue ${appEnv.DATABASE_REPL_SLOT_NAME} }`,
      )
    })

    await listeningService.subscribe(
      wal2JsonPlugin,
      appEnv.DATABASE_REPL_SLOT_NAME,
    )
  } finally {
    await amqpClient.disconnect().catch(console.error)
  }
}

void go().catch(console.error)
