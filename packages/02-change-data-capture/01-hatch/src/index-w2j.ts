// listeningService.on('data', async (lsn: string, msg: Wal2Json.Output) => {
//   try {
//     if (!isSupportedW2jMessage(msg)) {
//       return
//     }
//     const eventId = uuid()
//     const messageObject = objectifyMessageV2(
//       msg as unknown as Wal2JsonMessageV2,
//       eventId,
//     )
//     const messageType = `${messageObject.table}.${messageObject.operation}`
//     const key = `${appEnv.AMQP_ROUTING_KEY}.${messageType}`

//     await amqpExchange.sendJson(key, messageObject, {
//       type: messageType,
//       contentType: 'application/json',
//       messageId: eventId,
//       timestamp: messageObject.occuredAt.getTime(),
//     })

//     console.log(chalk`Forwarded {bold ${key}} event [{blue ${lsn}}]`)
//     console.log(chalk`=> to [{blue ${eventId}}]`)
//   } catch (err: unknown) {
//     console.error(chalk`Error forwarding event {red ${lsn}}`)
//     console.error(err)
//     console.debug(msg)
//   }
// })

// listeningService.on('start', () => {
//   console.log(
//     chalk`Waiting for wal2json logs on {blue ${appEnv.DATABASE_REPL_WAL2JSON_SLOT_NAME} }`,
//   )
// })

// await listeningService.subscribe(
//   wal2JsonPlugin,
//   appEnv.DATABASE_REPL_WAL2JSON_SLOT_NAME,
// )
