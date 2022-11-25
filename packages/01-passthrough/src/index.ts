import chalk from 'chalk'
import { amqpClient, amqpExchange } from '@algar/cdc-amqp'
import { Wal2Json } from 'pg-logical-replication'
import { appEnv } from './env/app-env'
import { serializeChange } from './message'
import { v4 as uuid } from 'uuid'

import { listeningService, wal2JsonPlugin } from './repl-log-service'

const go = async () => {
  try {
    await amqpClient.connect(appEnv.AMQP_URL)

    listeningService.on('data', async (lsn: string, msg: Wal2Json.Output) => {
      for (const msgChange of msg.change) {
        try {
          const key = `${appEnv.AMQP_ROUTING_KEY}.${msgChange.table}.${msgChange.kind}`
          const messageId = uuid()
          const serializedMsg = serializeChange(
            msgChange,
            messageId,
            msg.timestamp,
          )

          await amqpExchange.sendJson(key, serializedMsg, {
            type: `${msgChange.table}.${msgChange.kind}`,
            contentType: 'application/json',
            messageId: messageId,
            timestamp: serializedMsg.occuredAt.getTime(),
          })

          console.log(chalk`Forwarded {bold ${key}} event [{blue ${lsn}}]`)
          console.log(chalk`=> to [{blue ${messageId}}]`)
        } catch (err: unknown) {
          console.error(chalk`Error forwarding event {red ${lsn}}`)
          console.error(err)
          console.debug(msgChange)
        }
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

    // listeningService.on('data', async (lsn: string, msg: Pgoutput.Message) => {
    //   // Ignoring DSL operations and transaction operations
    //   if (!isDdlChangeMessage(msg)) {
    //     return
    //   }

    //   try {
    //     const key = `${appEnv.AMQP_ROUTING_KEY}.${msg.relation.name}.${msg.tag}`
    //     const messageId = uuid()
    //     const serializedMsg = serializeMessage(msg)
    //     const encodedMsg = encodeMessage(serializedMsg)

    //     await amqpExchange.send(key, encodedMsg, {
    //       type: `${msg.relation.name}.${msg.tag}`,
    //       contentType: 'application/json',
    //       messageId: messageId,
    //     })

    //     console.log(chalk`Forwarded {bold ${key}} event [{blue ${lsn}}]`)
    //     console.log(chalk`=> to [{blue ${messageId}}]`)
    //   } catch (err: unknown) {
    //     console.error(chalk`Error forwarding event {red ${lsn}}`)
    //     console.error(err)
    //     console.debug(msg)
    //   }
    // })

    // listeningService.on('start', () => {
    //   console.log(
    //     chalk`Waiting for pgoutput logs on {blue ${appEnv.DATABASE_REPL_SLOT_NAME}.${appEnv.DATABASE_REPL_PUB_NAME} }`,
    //   )
    // })

    // await listeningService.subscribe(
    //   pgOutputPlugin,
    //   appEnv.DATABASE_REPL_SLOT_NAME,
    // )
  } finally {
    await amqpClient.disconnect().catch(console.error)
  }
}

void go().catch(console.error)
