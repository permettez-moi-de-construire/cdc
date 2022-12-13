import { appEnv } from './env/app-env'
import winston, { LeveledLogMethod } from 'winston'
import type { ConsumeMessageFields, MessageProperties } from 'amqplib'
import { AmqpQueue } from '@permettezmoideconstruire/amqp-connector'
import chalk from 'chalk'
import { Webhook } from '@algar/theia-db'

const logger = winston.createLogger({
  level: appEnv.LOG_LEVEL,
  format: winston.format.simple(),
  transports: [new winston.transports.Console({ handleExceptions: true })],
})

const logAmqpEvent =
  (logLevel: LeveledLogMethod) =>
  (
    event: {
      fields: ConsumeMessageFields
      properties: MessageProperties
    },
    queue: AmqpQueue,
  ) => {
    logLevel(
      chalk`{grey [${event.properties.timestamp}]} (${queue.name}) Received event {green ${event.fields.routingKey}} {bold [${event.properties.messageId}]}`,
    )
  }

const logFullAmqpEvent =
  (logLevel: LeveledLogMethod) =>
  (event: { fields: ConsumeMessageFields; properties: MessageProperties }) => {
    logLevel(chalk`{blue ${JSON.stringify(event, null, 2)} }`)
  }

const logDetailledSubscribe =
  (logLevel: LeveledLogMethod) =>
  (
    routingKey: string,
    consumerTag: string,
    queue: AmqpQueue,
    webhook: Webhook,
  ) => {
    logLevel(chalk`Queue:        {cyan ${queue.name} }`)
    logLevel(chalk`Key:          {cyan ${routingKey} }`)
    logLevel(chalk`Consumer tag: {cyan ${consumerTag} }`)
    logLevel(chalk`Url:          {cyan ${webhook.url} }`)
  }
export { logger, logAmqpEvent, logFullAmqpEvent, logDetailledSubscribe }
