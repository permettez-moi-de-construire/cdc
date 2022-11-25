import chalk from 'chalk'
import { PrismaClient } from '@prisma/client'

const createWal2jsonExtension = async () => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRaw`CREATE EXTENSION wal2json`
    console.log(chalk`Postgres {blue wal2json} extension created`)
  } catch (err) {
    console.error(chalk`Error creating postgres {red wal2json} extension`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(console.error)
  }
}

const dropWal2jsonExtension = async () => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRaw`DROP EXTENSION wal2json`
    console.log(chalk`Postgres {blue wal2json} dropped`)
  } catch (err) {
    console.error(chalk`Error dropping postgres {red wal2json} extension`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(console.error)
  }
}

export { createWal2jsonExtension, dropWal2jsonExtension }
