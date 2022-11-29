import { PrismaClient } from '@algar/theia-db'

const prismaClient = new PrismaClient({
  // log: ['query', 'info', 'warn', 'error'],
})

const waitFor = (delay: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, delay)
  })

const go = async () => {
  try {
    await prismaClient.$connect()

    // Run some queries (creates, updates, deletes, transactions)
    console.log('Creating Bouba')
    const bouba = await prismaClient.bear.create({
      data: {
        nickName: 'Bouba',
      },
    })

    console.log('Creating Winnie')
    const winnie = await prismaClient.bear.create({
      data: {
        nickName: 'Winnie',
      },
    })

    console.log('Waiting...')
    await waitFor(2000)

    console.log('Transforming Bouba into Baloo')
    const baloo = await prismaClient.bear.update({
      data: {
        nickName: 'Baloo',
      },
      where: {
        id: bouba.id,
      },
    })

    console.log('Waiting...')
    await waitFor(1000)

    console.log('Updating both in transaction')
    try {
      await prismaClient.$transaction(async (tx) => {
        await tx.bear.update({
          data: {
            nickName: 'Balou',
          },
          where: {
            id: baloo.id,
          },
        })

        await tx.bear.update({
          data: {
            nickName: 'Winny',
          },
          where: {
            id: winnie.id,
          },
        })

        throw new Error('Expected')
      })
    } catch (err: unknown) {
      if (!(err instanceof Error) || err.message !== 'Expected') {
        throw err
      }
    }

    console.log('Waiting...')
    await waitFor(1000)

    console.log('Dropping both')
    await prismaClient.bear.deleteMany({
      where: {
        id: {
          in: [baloo.id, winnie.id],
        },
      },
    })
  } finally {
    await prismaClient.$disconnect().catch(console.error)
  }
}

void go().catch(console.error)
