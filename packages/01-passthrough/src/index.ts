import chalk from 'chalk'
import { amqpClient, amqpExchange } from '@algar/pg-amqp-poc-amqp'
import { Pgoutput } from 'pg-logical-replication'
import { appEnv } from './env/app-env'
import JSONBig from 'json-bigint'

import { listeningService, pgOutputPlugin } from './repl-log-service'

const go = async () => {
  try {
    await amqpClient.connect(appEnv.AMQP_URL)

    listeningService.on('data', async (lsn: string, log: Pgoutput.Message) => {
      try {
        const serializedLog = Buffer.from(JSONBig.stringify(log))
        await amqpExchange.send(appEnv.AMQP_ROUTING_KEY, serializedLog)
        console.log(chalk`Forwarded event {blue ${lsn} }`)
      } catch (err: unknown) {
        console.error(chalk`Error forwarding event {red ${lsn}}`)
        console.error(log)
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
