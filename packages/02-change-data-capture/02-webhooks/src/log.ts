import { createLogger, LogLevel } from '@algar/theia-common'
import { appEnv } from './env/app-env'

import type { ConsumeMessageFields, MessageProperties } from 'amqplib'
import { AmqpQueue } from '@permettezmoideconstruire/amqp-connector'
import { Webhook } from '@algar/theia-db'

export const logger = createLogger('amqp', appEnv.LOG_LEVEL)

export type LoggerMethod = (...msg: unknown[]) => void

const logAmqpEvent =
  (logLevel: LoggerMethod) =>
  (
    event: {
      fields: ConsumeMessageFields
      properties: MessageProperties
    },
    queue: AmqpQueue,
  ) => {
    logLevel(
      `[${event.properties.timestamp}] (${queue.name}) Received event ${event.fields.routingKey} [${event.properties.messageId}]`,
    )
  }

const logFullAmqpEvent =
  (logLevel: LoggerMethod) =>
  (event: { fields: ConsumeMessageFields; properties: MessageProperties }) => {
    logLevel(`${JSON.stringify(event, null, 2)}`)
  }

const logDetailledSubscribe =
  (logLevel: LoggerMethod) =>
  (
    routingKey: string,
    consumerTag: string,
    queue: AmqpQueue,
    webhook: Webhook,
  ) => {
    logLevel(`Queue:        ${queue.name}`)
    logLevel(`Key:          ${routingKey}`)
    logLevel(`Consumer tag: ${consumerTag}`)
    logLevel(`Url:          ${webhook.url}`)
  }

export { logAmqpEvent, logFullAmqpEvent, logDetailledSubscribe }
