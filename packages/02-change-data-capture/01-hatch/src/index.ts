import chalk from 'chalk'
import { amqpClient, amqpExchange } from '@algar/cdc-amqp'
import { Pgoutput, Wal2Json } from 'pg-logical-replication'
import { appEnv } from './env/app-env'
import { v4 as uuid } from 'uuid'
import {
  isBeginTransactionPgoMessage,
  isCommitTransactionPgoMessage,
  isSimpleDmlPgoMessage,
  isSupportedPgoMessage,
  pgoMessageToCDCMessage,
  commitTimeToDate,
} from './pgoutput-message'

import {
  listeningService,
  pgOutputPlugin,
  Wal2JsonMessageV2,
  wal2JsonPlugin,
} from './repl-log-service'

const go = async () => {
  try {
    await amqpClient.connect(appEnv.AMQP_URL)

    let lastTxTime: Date | null
    listeningService.on('data', async (lsn: string, msg: Pgoutput.Message) => {
      if (isBeginTransactionPgoMessage(msg)) {
        lastTxTime = commitTimeToDate(msg.commitTime)
        return
      }

      if (isCommitTransactionPgoMessage(msg)) {
        lastTxTime = null
        return
      }

      if (!isSimpleDmlPgoMessage(msg)) {
        console.debug(`Ignoring non dml message type ${msg.tag}`)
        return
      }

      if (!isSupportedPgoMessage(msg)) {
        console.warn(`Ignoring unsupported message format ${msg.tag}`)
        return
      }

      if (lastTxTime == null) {
        console.warn(`Ignoring message without transaction begin ${msg.tag}`)
        return
      }

      try {
        const eventId = uuid()
        const cdcMessage = pgoMessageToCDCMessage(msg, eventId, lastTxTime)
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
    })

    listeningService.on('start', () => {
      console.log(
        chalk`Waiting for pgoutput logs on {blue ${appEnv.DATABASE_REPL_PGOUTPUT_SLOT_NAME}.${appEnv.DATABASE_REPL_PGOUTPUT_PUB_NAME} }`,
      )
    })

    await listeningService.subscribe(
      pgOutputPlugin,
      appEnv.DATABASE_REPL_PGOUTPUT_SLOT_NAME,
    )

    // listeningService.on('data', async (lsn: string, msg: Wal2Json.Output) => {
    //   try {
    //     const eventId = uuid()
    //     const messageObject = objectifyMessageV2(
    //       msg as unknown as Wal2JsonMessageV2,
    //       eventId,
    //     )
    //     const messageType = `${messageObject.table}.${messageObject.operation}`
    //     const key = `${appEnv.AMQP_ROUTING_KEY}.${messageType}`

    //     await amqpExchange.sendJson(key, messageObject, {
    //       type: messageType,
    //       contentType: 'application/json',
    //       messageId: eventId,
    //       timestamp: messageObject.occuredAt.getTime(),
    //     })

    //     console.log(chalk`Forwarded {bold ${key}} event [{blue ${lsn}}]`)
    //     console.log(chalk`=> to [{blue ${eventId}}]`)
    //   } catch (err: unknown) {
    //     console.error(chalk`Error forwarding event {red ${lsn}}`)
    //     console.error(err)
    //     console.debug(msg)
    //   }
    // })

    // listeningService.on('start', () => {
    //   console.log(
    //     chalk`Waiting for wal2json logs on {blue ${appEnv.DATABASE_REPL_WAL2JSON_SLOT_NAME} }`,
    //   )
    // })

    // await listeningService.subscribe(
    //   wal2JsonPlugin,
    //   appEnv.DATABASE_REPL_WAL2JSON_SLOT_NAME,
    // )
  } finally {
    await amqpClient.disconnect().catch(console.error)
  }
}

void go().catch(console.error)
