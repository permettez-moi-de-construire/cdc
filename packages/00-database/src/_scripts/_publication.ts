import { PrismaClient } from '@prisma/client'
import { logger } from '../log'

const createPublication = async (pubName: string, schema?: string) => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await (schema != null
      ? prismaClient.$executeRawUnsafe(
          `CREATE PUBLICATION "${pubName}" FOR TABLES IN SCHEMA ${schema}`,
        )
      : prismaClient.$executeRawUnsafe(
          `CREATE PUBLICATION ${pubName} FOR ALL TABLES`,
        ))
    logger.info(`Postgres publication ${pubName} created`)
  } catch (err) {
    logger.error(`Error creating postgres publication ${pubName}`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(logger.error)
  }
}

const dropPublication = async (pubName: string) => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRawUnsafe(`DROP PUBLICATION ${pubName}`)
    logger.info(`Postgres publication ${pubName} dropped`)
  } catch (err) {
    logger.error(`Error dropping postgres publication ${pubName}`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(logger.error)
  }
}

export { createPublication, dropPublication }
