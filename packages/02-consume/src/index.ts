import chalk from 'chalk'
import { amqpClient, amqpQueue } from '@algar/pg-amqp-poc-amqp'
import { appEnv } from './env/app-env'
import JSONBig from 'json-bigint'

const go = async () => {
  try {
    await amqpClient.connect(appEnv.AMQP_URL)

    await new Promise(async () => {
      await amqpQueue.consume(
        async (msg) => {
          const parsedMsg = {
            ...msg,
            content: JSONBig.parse(msg.content.toString()),
          }
          console.log(`Received event`)
          console.log(chalk`{blue ${JSONBig.stringify(parsedMsg, null, 2)} }`)
        },
        { noAck: true },
      )

      console.log(chalk`Waiting for amqp events on {blue ${amqpQueue.name} }`)
    })
  } finally {
    await amqpClient.disconnect().catch(console.error)
  }
}

void go().then(console.log).catch(console.error)
