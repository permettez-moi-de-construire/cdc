import chalk from 'chalk'
import { PrismaClient } from '@prisma/client'

const createPublication = async (pubName: string, schema?: string) => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await (schema != null ? (
      prismaClient.$executeRawUnsafe(
        `CREATE PUBLICATION "${pubName}" FOR TABLES IN SCHEMA ${schema}`
      )
    ) : (
      prismaClient.$executeRawUnsafe(
        `CREATE PUBLICATION ${pubName} FOR ALL TABLES`,
      )
    ))
    console.log(chalk`Postgres publication {blue ${pubName}} created`)
  } catch (err) {
    console.error(chalk`Error creating postgres publication {red ${pubName}}`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(console.error)
  }
}

const dropPublication = async (pubName: string) => {
  const prismaClient = new PrismaClient()

  try {
    await prismaClient.$connect()

    await prismaClient.$executeRawUnsafe(
      `DROP PUBLICATION ${pubName}`
    )
    console.log(chalk`Postgres publication {blue ${pubName}} dropped`)
  } catch (err) {
    console.error(chalk`Error dropping postgres publication {red ${pubName}}`)
    throw err
  } finally {
    prismaClient.$disconnect().catch(console.error)
  }
}

export { createPublication, dropPublication }
