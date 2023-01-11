import { AnyConsumeMessage, getDlxOriginalQueueName } from '@algar/cdc-amqp'
import Amqp, { AmqpQueue } from '@permettezmoideconstruire/amqp-connector'
import { equal } from 'lauqe'

export const µsToDate = (µs: bigint): Date => new Date(Number(µs / 1000n))

export const compileShallowChanges = <T extends Record<string, unknown>>(
  oldVal: T,
  newVal: T,
): Partial<T> =>
  Object.fromEntries(
    Object.entries(newVal).filter(([k, v]) => !equal(v, oldVal[k])),
  ) as Partial<T>

export const getDlxOriginalQueue =
  (amqp: Amqp) =>
  (message: AnyConsumeMessage): [AmqpQueue | null, string | null] => {
    const _originalQueueName = getDlxOriginalQueueName(message)

    // WARNING: Dangerous
    // TODO: find a better way of doing this
    // In here, the queue defined on the amqpClient is not present
    // because we're not using the same Amqp instance than
    // used for defining the queue originally
    const originalQueue =
      _originalQueueName != null
        ? amqp.queue(_originalQueueName) ??
          amqp.defineQueue(_originalQueueName, {})
        : null

    // TODO: fix (Original code)
    // const originalQueue =
    //   _originalQueueName != null ? amqp.queue(_originalQueueName) : null

    return [originalQueue, _originalQueueName]
  }
