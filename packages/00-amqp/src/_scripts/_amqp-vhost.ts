import chalk from 'chalk'
import axios from 'axios'
import { MgmtEnv } from '../env/mgmt-env'

const createVhost = async (env: MgmtEnv) => {
  const amqpMgmtAxios = axios.create({
    baseURL: env.AMQP_MGMT_API_URL,
  })

  try {
    await amqpMgmtAxios.put(`/vhosts/${env.AMQP_VHOST}`)
    console.log(chalk`Amqp vhost {blue ${env.AMQP_VHOST}} created`)
  } catch (err) {
    console.error(chalk`Error creating amqp vhost {red ${env.AMQP_VHOST}}`)
    throw err
  }
}

const dropVhost = async (env: MgmtEnv) => {
  const amqpMgmtAxios = axios.create({
    baseURL: env.AMQP_MGMT_API_URL,
  })

  try {
    await amqpMgmtAxios.delete(`/vhosts/${env.AMQP_VHOST}`)
    console.log(chalk`Amqp vhost {blue ${env.AMQP_VHOST}} dropped`)
  } catch (err) {
    console.error(chalk`Error dropping amqp vhost {red ${env.AMQP_VHOST}}`)
    throw err
  }
}

export { createVhost, dropVhost }
