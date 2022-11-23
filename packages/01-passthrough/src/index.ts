import chalk from 'chalk'
import { amqpClient, amqpExchange } from '@algar/pg-amqp-poc-amqp'
import { Pgoutput } from 'pg-logical-replication'
import { appEnv } from './env/app-env'
import JSONBig from 'json-bigint'

import { listeningService, pgOutputPlugin } from './repl-log-service'

type MessageDDL =
  | Pgoutput.MessageInsert
  | Pgoutput.MessageUpdate
  | Pgoutput.MessageDelete

const isDdlChangeMessage = (msg: Pgoutput.Message): msg is MessageDDL =>
  (msg as MessageDDL).tag != null &&
  ['insert', 'update', 'delete'].includes(msg.tag)

const go = async () => {
  try {
    await amqpClient.connect(appEnv.AMQP_URL)

    listeningService.on('data', async (lsn: string, msg: Pgoutput.Message) => {
      if (!isDdlChangeMessage(msg)) {
        // Ignoring DSL operations and transaction operations
        return
      }

      try {
        const serializedMsg = Buffer.from(JSONBig.stringify(msg))
        await amqpExchange.send(
          `${appEnv.AMQP_ROUTING_KEY}.${msg.relation.name}.${msg.relation}`,
          serializedMsg,
        )
        console.log(chalk`Forwarded event {blue ${lsn} }`)
      } catch (err: unknown) {
        console.error(chalk`Error forwarding event {red ${lsn}}`)
        console.error(msg)
        console.error(err)
      }
    })

    listeningService.on('start', () => {
      console.log(
        chalk`Waiting for pgoutput logs on {blue ${appEnv.DATABASE_REPL_SLOT_NAME}.${appEnv.DATABASE_REPL_PUB_NAME} }`,
      )
    })

    await listeningService.subscribe(
      pgOutputPlugin,
      appEnv.DATABASE_REPL_SLOT_NAME,
    )
  } finally {
    await amqpClient.disconnect().catch(console.error)
  }
}

void go().catch(console.error)
