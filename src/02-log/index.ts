import chalk from 'chalk'
import { Amqp } from '@permettezmoideconstruire/amqp-connector'
import { Pgoutput } from 'pg-logical-replication'
import { appEnv } from '../common/env/app-env'

import { listeningService, pgOutputPlugin } from '../common/repl-log-service'

const amqpClient = new Amqp({
  confirm: true,
})

const go = async () => {
  try {
    amqpClient.connect(appEnv.AMQP_URL)

    listeningService.on('data', (lsn: string, log: Pgoutput.Message) => {
      console.log(log)
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
    amqpClient.disconnect().catch(console.error)
  }
}

void go().catch(console.error)
