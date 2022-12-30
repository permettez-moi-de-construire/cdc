import axios from 'axios'
import { MgmtEnv } from '../env/mgmt-env'
import { logger } from '../log'

const createVhost = async (env: MgmtEnv) => {
  const amqpMgmtAxios = axios.create({
    baseURL: env.AMQP_MGMT_API_URL,
  })

  try {
    await amqpMgmtAxios.put(`/vhosts/${env.AMQP_VHOST}`)
    logger.info(`Amqp vhost ${env.AMQP_VHOST} created`)
  } catch (err) {
    logger.error(`Error creating amqp vhost ${env.AMQP_VHOST}`)
    throw err
  }
}

const dropVhost = async (env: MgmtEnv) => {
  const amqpMgmtAxios = axios.create({
    baseURL: env.AMQP_MGMT_API_URL,
  })

  try {
    await amqpMgmtAxios.delete(`/vhosts/${env.AMQP_VHOST}`)
    logger.info(`Amqp vhost ${env.AMQP_VHOST} dropped`)
  } catch (err) {
    logger.error(`Error dropping amqp vhost ${env.AMQP_VHOST}`)
    throw err
  }
}

export { createVhost, dropVhost }
