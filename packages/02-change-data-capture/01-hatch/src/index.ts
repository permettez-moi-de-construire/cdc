import {
  amqpClient,
  amqpErrorQueue,
  amqpExchange,
  amqpRequeueQueue,
  amqpWaitExchange,
} from '@algar/cdc-amqp'
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
import { handleError, handleRequeue } from './error'
import { logger } from './log'

const go = async () => {
  try {
    await amqpClient.connect(appEnv.AMQP_URL)

    listeningService.on(
      'data',
      wrapPgoMessage(
        async (lsn: string, commitedAt: Date, msg: Pgoutput.Message) => {
          if (!isSimpleDmlPgoutputMessage(msg)) {
            logger.debug(`Ignoring non dml message type ${msg.tag}`)
            return
          }

          if (!isSupportedPgoutputMessage(msg)) {
            logger.warn(`Ignoring unsupported message format ${msg.tag}`)
            return
          }

          try {
            const eventId = uuid()
            const cdcMessage = pgoMessageToCDCMessage(msg, eventId, commitedAt)

            const messageType = `${cdcMessage.schema}.${cdcMessage.table}.${cdcMessage.operation}`
            const key = `${appEnv.AMQP_ROUTING_KEY}.${messageType}`

            await amqpExchange.sendJson(key, cdcMessage, {
              type: messageType,
              contentType: 'application/json',
              messageId: eventId,
              timestamp: cdcMessage.occurredAt.getTime(),
            })

            logger.info(`Forwarded ${key} event {${lsn}}`)
            logger.info(`=> to {${eventId}}`)
          } catch (err: unknown) {
            logger.error(`Error forwarding event {${lsn}}`)
            logger.error(err)
            logger.debug(msg)
          }
        },
      ),
    )

    listeningService.on('start', () => {
      logger.info(
        `Waiting for pgoutput logs on ${appEnv.DATABASE_REPL_PGOUTPUT_SLOT_NAME}.${appEnv.DATABASE_REPL_PGOUTPUT_PUB_NAME}`,
      )
    })

    await handleError(
      amqpErrorQueue,
      amqpWaitExchange,
      appEnv.AMQP_REQUEUE_DELAYS,
    )

    await handleRequeue(amqpClient)(amqpRequeueQueue)

    await listeningService.subscribe(
      pgOutputPlugin,
      appEnv.DATABASE_REPL_PGOUTPUT_SLOT_NAME,
    )
  } finally {
    await amqpClient.disconnect().catch(logger.error)
  }
}

void go().catch(logger.error)
