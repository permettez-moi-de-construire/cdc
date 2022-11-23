import chalk from 'chalk'
import { Amqp } from '@permettezmoideconstruire/amqp-connector'
import { appEnv } from './env/app-env'
import JSONBig from 'json-bigint'

const amqpClient = new Amqp({
  confirm: true,
})

const amqpExchange = amqpClient.defineQueue(appEnv.AMQP_CONSUME_QUEUE, {
  durable: true,
})

const go = async () => {
  try {
    await amqpClient.connect(appEnv.AMQP_URL)

    await new Promise(async () => {
      await amqpExchange.consume(
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

      console.log(
        chalk`Waiting for amqp events on {blue ${appEnv.AMQP_CONSUME_QUEUE} }`,
      )
    })
  } finally {
    await amqpClient.disconnect().catch(console.error)
  }
}

void go().then(console.log).catch(console.error)
