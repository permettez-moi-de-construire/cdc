import { Amqp } from '@permettezmoideconstruire/amqp-connector'
import { MgmtEnv } from '../env/mgmt-env'
import type { Options } from 'amqplib'
import { logger } from '../log'

const createQueue = async (
  env: MgmtEnv,
  queueName: string,
  options?: Options.AssertQueue,
) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient._getChannel().assertQueue(queueName, {
      durable: true,
      ...options,
    })
    logger.info(`Amqp queue ${queueName} created`)
  } catch (err) {
    logger.error(`Error creating amqp queue ${queueName}`)
    throw err
  } finally {
    amqpClient.disconnect().catch(logger.error)
  }
}

const dropQueue = async (env: MgmtEnv, queueName: string) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient._getChannel().deleteQueue(queueName)
    logger.info(`Amqp queue ${queueName} dropped`)
  } catch (err) {
    logger.error(`Error dropping amqp queue ${queueName}`)
    throw err
  } finally {
    amqpClient.disconnect().catch(logger.error)
  }
}

const createExchange = async (
  env: MgmtEnv,
  exchangeName: string,
  exchangeType: string,
  options?: Options.AssertExchange,
) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient._getChannel().assertExchange(exchangeName, exchangeType, {
      durable: true,
      ...options,
    })

    logger.info(`Amqp exchange ${exchangeName} (${exchangeType}) created`)
  } catch (err) {
    logger.error(
      `Error creating amqp exchange ${exchangeName} (${exchangeType})`,
    )
    throw err
  } finally {
    amqpClient.disconnect().catch(logger.error)
  }
}

const dropExchange = async (env: MgmtEnv, exchangeName: string) => {
  const amqpClient = new Amqp({ confirm: true })

  try {
    await amqpClient.connect(env.AMQP_URL)

    await amqpClient._getChannel().deleteExchange(exchangeName)
    logger.info(`Amqp exchange ${exchangeName} dropped`)
  } catch (err) {
    logger.error(`Error dropping amqp exchange ${exchangeName}`)
    throw err
  } finally {
    amqpClient.disconnect().catch(logger.error)
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
    logger.info(
      `Amqp queue ${queueName} bound to ${exchangeName} for key ${routingKey}`,
    )
  } catch (err) {
    logger.error(
      `Error binding amqp queue ${queueName} to exchange ${exchangeName} for key ${routingKey}`,
    )
    throw err
  } finally {
    amqpClient.disconnect().catch(logger.error)
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
    logger.info(
      `Amqp queue ${queueName} unbound from ${exchangeName} for key ${routingKey}`,
    )
  } catch (err) {
    logger.error(
      `Error unbinding amqp queue ${queueName} from exchange ${exchangeName} for key ${routingKey}`,
    )
    throw err
  } finally {
    amqpClient.disconnect().catch(logger.error)
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
