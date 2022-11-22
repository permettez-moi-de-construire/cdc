import chalk from 'chalk'
import { PrismaClient } from '@prisma/client'

type REPL_SLOT_TYPE = 'pgoutput' | 'wal2json' | 'decoderbufs'

const createReplSlot = async (name: string, slotType: REPL_SLOT_TYPE) => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRaw`SELECT * FROM pg_create_logical_replication_slot(${name}, ${slotType})`
    console.log(chalk`Postgres replication slot {blue ${name}} created`)
  } catch (err) {
    console.error(chalk`Error creating postgres replication slot {red ${name}}`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(console.error)
  }
}

const dropReplSlot = async (name: string) => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRaw`SELECT * FROM pg_drop_replication_slot(${name})`
    console.log(chalk`Postgres replication slot {blue ${name}} dropped`)
  } catch (err) {
    console.error(chalk`Error dropping postgres replication slot {red ${name}}`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(console.error)
  }
}

export { createReplSlot, dropReplSlot }
