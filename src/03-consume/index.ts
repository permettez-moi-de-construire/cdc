import { PrismaClient } from '@prisma/client'
import { Amqp } from '@permettezmoideconstruire/amqp-connector'
import { appEnv } from '../common/env/app-env'

const prismaClient = new PrismaClient()
const amqpClient = new Amqp({
  confirm: true,
})

const go = async () => {
  try {
    await Promise.all([
      prismaClient.$connect(),
      amqpClient.connect(appEnv.AMQP_URL),
    ])
  } finally {
    await Promise.all([
      prismaClient.$disconnect().catch(console.error),
      amqpClient.disconnect().catch(console.error),
    ])
  }
}

void go().then(console.log).catch(console.error)
