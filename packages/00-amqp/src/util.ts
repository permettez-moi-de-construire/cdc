import { ConsumeJsonMessage } from '@permettezmoideconstruire/amqp-connector'
import type { ConsumeMessage, Options, XDeath } from 'amqplib'
import {
  Amqp,
  AmqpQueue,
  AmqpExchange,
} from '@permettezmoideconstruire/amqp-connector'

export type AnyConsumeMessage = ConsumeMessage | ConsumeJsonMessage
export const isConsumeJsonMessage = (
  msg: AnyConsumeMessage,
): msg is ConsumeJsonMessage => !Buffer.isBuffer(msg.content)

export const replicatePropertiesForPublish = (
  message: AnyConsumeMessage,
): Options.Publish => {
  const newPublishOptions: Options.Publish = {
    appId: message.properties.appId,
    contentEncoding: message.properties.contentEncoding,
    contentType: message.properties.contentType,
    correlationId: message.properties.correlationId,
    deliveryMode: message.properties.deliveryMode,
    expiration: message.properties.expiration,
    headers: message.properties.headers,
    messageId: message.properties.messageId,
    priority: message.properties.priority,
    replyTo: message.properties.replyTo,
    timestamp: message.properties.timestamp,
    type: message.properties.type,
    userId: message.properties.userId,
  }

  return newPublishOptions
}

type XDeathReason = XDeath['reason']

export const getDlxDeathCount = (
  message: AnyConsumeMessage,
  relevantReason: XDeathReason = 'rejected',
) => {
  const xDeaths = message.properties.headers['x-death'] ?? []
  const relevantXDeath = xDeaths.find(
    (xDeath) => xDeath.reason === relevantReason,
  )

  const relevantXDeathsCount = relevantXDeath?.count ?? 0

  return relevantXDeathsCount
}

export const getDlxOriginalQueueName = (message: AnyConsumeMessage) => {
  // Retreive original queue where message errored
  const _originalQueueName =
    message.properties.headers['x-first-death-queue'] ?? null

  return _originalQueueName
}

export const getRepublishOptions = (
  msg: AnyConsumeMessage,
  newOptions: Options.Publish = {},
) => {
  const newPublishOptions: Options.Publish = {
    appId: msg.properties.appId,
    contentEncoding: msg.properties.contentEncoding,
    contentType: msg.properties.contentType,
    correlationId: msg.properties.correlationId,
    deliveryMode: msg.properties.deliveryMode,
    expiration: msg.properties.expiration,
    messageId: msg.properties.messageId,
    priority: msg.properties.priority,
    replyTo: msg.properties.replyTo,
    timestamp: msg.properties.timestamp,
    type: msg.properties.type,
    userId: msg.properties.userId,
    ...newOptions,
    headers: {
      ...msg.properties.headers,
      ...newOptions.headers,
    },
  }

  return newPublishOptions
}

export const getDelayedRepublishOptions = (
  msg: AnyConsumeMessage,
  delay: number,
  newOptions: Options.Publish = {},
) => {
  const newPublishOptions = getRepublishOptions(msg, {
    ...newOptions,
    headers: {
      'x-delay': delay,
      ...newOptions.headers,
    },
  })

  return newPublishOptions
}
