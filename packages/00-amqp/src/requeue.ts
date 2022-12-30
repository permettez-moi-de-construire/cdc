import { milliseconds } from 'date-fns'

export type RequeueQueueId = `requeue-wait-${number}`
export const getRequeueQueueId = (
  requeueDelayDuration: Duration,
): RequeueQueueId => {
  const ms = milliseconds(requeueDelayDuration)
  return `requeue-wait-${ms}`
}

export type RequeueQueueName = `RequeueWait${number}`
export const getRequeueQueueName = (
  requeueDelayDuration: Duration,
): RequeueQueueName => {
  const ms = milliseconds(requeueDelayDuration)
  return `RequeueWait${ms}`
}
