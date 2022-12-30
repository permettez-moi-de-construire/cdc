import { PrismaClient } from '@prisma/client'
import { logger } from '../log'

type REPL_SLOT_TYPE = 'pgoutput' | 'wal2json' | 'decoderbufs'

const createReplSlot = async (name: string, slotType: REPL_SLOT_TYPE) => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRaw`SELECT * FROM pg_create_logical_replication_slot(${name}, ${slotType})`
    logger.info(`Postgres replication slot ${name} created`)
  } catch (err) {
    logger.error(`Error creating postgres replication slot ${name}`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(logger.error)
  }
}

const dropReplSlot = async (name: string) => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRaw`SELECT * FROM pg_drop_replication_slot(${name})`
    logger.info(`Postgres replication slot ${name} dropped`)
  } catch (err) {
    logger.error(`Error dropping postgres replication slot ${name}`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(logger.error)
  }
}

export { createReplSlot, dropReplSlot }
