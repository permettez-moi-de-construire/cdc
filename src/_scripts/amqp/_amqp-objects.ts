import chalk from 'chalk'
import { Amqp } from '@permettezmoideconstruire/amqp-connector'
import { MgmtEnv } from '../../common/env/mgmt-env'

const createQueue = async (env: MgmtEnv, queueName: string) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient._getChannel().assertQueue(queueName, { durable: true })
    console.log(chalk`Amqp queue {blue ${queueName}} created`)
  } catch (err) {
    console.error(chalk`Error creating amqp queue {red ${queueName}}`)
    throw err
  } finally {
    amqpClient.disconnect().catch(console.error)
  }
}

const dropQueue = async (env: MgmtEnv, queueName: string) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient._getChannel().deleteQueue(queueName)
    console.log(chalk`Amqp queue {blue ${queueName}} dropped`)
  } catch (err) {
    console.error(chalk`Error dropping amqp queue {red ${queueName}}`)
    throw err
  } finally {
    amqpClient.disconnect().catch(console.error)
  }
}

const createExchange = async (
  env: MgmtEnv,
  exchangeName: string,
  exchangeType: string,
) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient
      ._getChannel()
      .assertExchange(exchangeName, exchangeType, { durable: true })
    console.log(
      chalk`Amqp exchange {blue ${exchangeName}.${exchangeType}} created`,
    )
  } catch (err) {
    console.error(
      chalk`Error creating amqp exchange {red ${exchangeName}.${exchangeType}}`,
    )
    throw err
  } finally {
    amqpClient.disconnect().catch(console.error)
  }
}

const dropExchange = async (env: MgmtEnv, exchangeName: string) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient._getChannel().deleteExchange(exchangeName)
    console.log(chalk`Amqp exchange {blue ${exchangeName}} dropped`)
  } catch (err) {
    console.error(chalk`Error dropping amqp exchange {red ${exchangeName}}`)
    throw err
  } finally {
    amqpClient.disconnect().catch(console.error)
  }
}

const bindQueue = async (
  env: MgmtEnv,
  exchangeName: string,
  queueName: string,
  routingKey: string,
) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient
      ._getChannel()
      .bindQueue(queueName, exchangeName, routingKey)
    console.log(
      chalk`Amqp queue {blue ${queueName}} bound to {blue ${exchangeName}} for key {blue ${routingKey}}`,
    )
  } catch (err) {
    console.error(
      chalk`Error binding amqp queue {red ${queueName}} to exchange {red ${exchangeName}} for key {red ${routingKey}}`,
    )
    throw err
  } finally {
    amqpClient.disconnect().catch(console.error)
  }
}

const unbindQueue = async (
  env: MgmtEnv,
  exchangeName: string,
  queueName: string,
  routingKey: string,
) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient
      ._getChannel()
      .unbindQueue(queueName, exchangeName, routingKey)
    console.log(
      chalk`Amqp queue {blue ${queueName}} unbound from {blue ${exchangeName}} for key {blue ${routingKey}}`,
    )
  } catch (err) {
    console.error(
      chalk`Error unbinding amqp queue {red ${queueName}} from exchange {red ${exchangeName}} for key {red ${routingKey}}`,
    )
    throw err
  } finally {
    amqpClient.disconnect().catch(console.error)
  }
}

export {
  createQueue,
  dropQueue,
  createExchange,
  dropExchange,
  bindQueue,
  unbindQueue,
}
