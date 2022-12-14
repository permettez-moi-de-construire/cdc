import chalk from 'chalk'
import { amqpClient, amqpExchange } from '@algar/cdc-amqp'
import { Pgoutput } from 'pg-logical-replication'
import { appEnv } from './env/app-env'
import { v4 as uuid } from 'uuid'
import {
  isSimpleDmlPgoutputMessage,
  isSupportedPgoutputMessage,
  pgoMessageToCDCMessage,
  wrapPgoMessage,
} from './wal/pgoutput-message'

import { listeningService, pgOutputPlugin } from './wal/repl-log-service'

const go = async () => {
  try {
    await amqpClient.connect(appEnv.AMQP_URL)

    listeningService.on(
      'data',
      wrapPgoMessage(
        async (lsn: string, commitedAt: Date, msg: Pgoutput.Message) => {
          if (!isSimpleDmlPgoutputMessage(msg)) {
            console.debug(`Ignoring non dml message type ${msg.tag}`)
            return
          }

          if (!isSupportedPgoutputMessage(msg)) {
            console.warn(`Ignoring unsupported message format ${msg.tag}`)
            return
          }

          try {
            const eventId = uuid()
            const cdcMessage = pgoMessageToCDCMessage(msg, eventId, commitedAt)
            console.log(cdcMessage)

            const messageType = `${cdcMessage.schema}.${cdcMessage.table}.${cdcMessage.operation}`
            const key = `${appEnv.AMQP_ROUTING_KEY}.${messageType}`

            await amqpExchange.sendJson(key, cdcMessage, {
              type: messageType,
              contentType: 'application/json',
              messageId: eventId,
              timestamp: cdcMessage.occuredAt.getTime(),
            })

            console.log(chalk`Forwarded {bold ${key}} event [{blue ${lsn}}]`)
            console.log(chalk`=> to [{blue ${eventId}}]`)
          } catch (err: unknown) {
            console.error(chalk`Error forwarding event {red ${lsn}}`)
            console.error(err)
            console.debug(msg)
          }
        },
      ),
    )

    listeningService.on('start', () => {
      console.log(
        chalk`Waiting for pgoutput logs on {blue ${appEnv.DATABASE_REPL_PGOUTPUT_SLOT_NAME}.${appEnv.DATABASE_REPL_PGOUTPUT_PUB_NAME} }`,
      )
    })

    await listeningService.subscribe(
      pgOutputPlugin,
      appEnv.DATABASE_REPL_PGOUTPUT_SLOT_NAME,
    )
  } finally {
    await amqpClient.disconnect().catch(console.error)
  }
}

void go().catch(console.error)
