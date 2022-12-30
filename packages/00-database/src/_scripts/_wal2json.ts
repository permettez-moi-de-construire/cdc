import { PrismaClient } from '@prisma/client'
import { logger } from '../log'

const createWal2jsonExtension = async () => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRaw`CREATE EXTENSION wal2json`
    logger.info(`Postgres wal2json extension created`)
  } catch (err) {
    logger.error(`Error creating postgres wal2json extension`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(logger.error)
  }
}

const dropWal2jsonExtension = async () => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRaw`DROP EXTENSION wal2json`
    logger.info(`Postgres wal2json dropped`)
  } catch (err) {
    logger.error(`Error dropping postgres wal2json extension`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(logger.error)
  }
}

export { createWal2jsonExtension, dropWal2jsonExtension }
