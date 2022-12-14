import { Pgoutput } from 'pg-logical-replication'
import {
  CDCDeleteMessage,
  CDCInsertMessage,
  CDCMessageV2,
  CDCUpdateMessage,
} from '../cdc-message'
import { µsToDate, compileShallowChanges } from '../util'

export const simpleDmlMessageTags = ['insert', 'update', 'delete'] as const
export const PgoutputMessageDmlTags = [
  ...simpleDmlMessageTags,
  'truncate',
] as const

export type PgoutputMessageSimpleDmlTag = typeof simpleDmlMessageTags[number]
export type PgoutputMessageDmlTag = typeof PgoutputMessageDmlTags[number]

export type PgoutputMessageDml =
  | Pgoutput.MessageInsert
  | Pgoutput.MessageUpdate
  | Pgoutput.MessageDelete
  | Pgoutput.MessageTruncate

export type SimplePgoutputMessageDml = Exclude<
  PgoutputMessageDml,
  Pgoutput.MessageTruncate
>

export type SupportedPgoMessageUpdate = Pgoutput.MessageUpdate & {
  old: NonNullable<Pgoutput.MessageUpdate['old']>
}
export type SupportedPgoMessageDelete = Pgoutput.MessageDelete & {
  old: NonNullable<Pgoutput.MessageDelete['old']>
}
export type SupportedPgoMessage =
  | Pgoutput.MessageInsert
  | SupportedPgoMessageUpdate
  | SupportedPgoMessageDelete

export const msgHasOld = (
  msg: Pgoutput.MessageUpdate | Pgoutput.MessageDelete,
): msg is SupportedPgoMessageUpdate | SupportedPgoMessageDelete => {
  return msg.old != null
}

export const isDmlPgoutputMessage = (
  pgoMsg: Pgoutput.Message,
): pgoMsg is PgoutputMessageDml =>
  PgoutputMessageDmlTags.includes(pgoMsg.tag as PgoutputMessageDmlTag)

export const isSimpleDmlPgoutputMessage = (
  pgoMsg: Pgoutput.Message,
): pgoMsg is SimplePgoutputMessageDml =>
  simpleDmlMessageTags.includes(pgoMsg.tag as PgoutputMessageSimpleDmlTag)

export const isSupportedPgoutputMessage = (
  pgoMsg: SimplePgoutputMessageDml,
): pgoMsg is SupportedPgoMessage => {
  switch (pgoMsg.tag) {
    case 'insert':
      return true
    case 'update':
    case 'delete':
      return msgHasOld(pgoMsg)
    default:
      return false
  }
}

export const isBeginTransactionPgoMessage = (
  pgoMsg: Pgoutput.Message,
): pgoMsg is Pgoutput.MessageBegin =>
  (pgoMsg as Pgoutput.MessageBegin).tag === 'begin'

export const isCommitTransactionPgoMessage = (
  pgoMsg: Pgoutput.Message,
): pgoMsg is Pgoutput.MessageCommit =>
  (pgoMsg as Pgoutput.MessageCommit).tag === 'commit'

export const pgoMessageToCDCMessage = (
  pgoMsg: SupportedPgoMessage,
  eventId: string,
  commitTime: Date,
): CDCMessageV2 => {
  switch (pgoMsg.tag) {
    case 'insert':
      return pgoInsertMessageToCDCInsertMessage(pgoMsg, eventId, commitTime)
    case 'update':
      return pgoUpdateMessageToCDCUpdateMessage(pgoMsg, eventId, commitTime)
    case 'delete':
      return pgoDeleteMessageToCDCDeleteMessage(pgoMsg, eventId, commitTime)
  }
}

export const pgoInsertMessageToCDCInsertMessage = (
  pgoMsg: Pgoutput.MessageInsert,
  eventId: string,
  commitTime: Date,
): CDCInsertMessage => {
  return {
    eventId,
    table: pgoMsg.relation.name,
    schema: pgoMsg.relation.schema,
    operation: 'insert',
    // Remove strange symbol key
    new: { ...pgoMsg.new },
    occuredAt: commitTime,
  }
}

export const pgoUpdateMessageToCDCUpdateMessage = (
  pgoMsg: SupportedPgoMessageUpdate,
  eventId: string,
  commitTime: Date,
): CDCUpdateMessage => {
  return {
    eventId,
    table: pgoMsg.relation.name,
    schema: pgoMsg.relation.schema,
    operation: 'update',
    // TODO: fix
    changes: compileShallowChanges(pgoMsg.old, pgoMsg.new),
    // Remove strange symbol key
    new: { ...pgoMsg.new },
    // Remove strange symbol key
    old: { ...pgoMsg.old },
    occuredAt: commitTime,
  }
}

export const pgoDeleteMessageToCDCDeleteMessage = (
  pgoMsg: SupportedPgoMessageDelete,
  eventId: string,
  commitTime: Date,
): CDCDeleteMessage => {
  return {
    eventId,
    table: pgoMsg.relation.name,
    schema: pgoMsg.relation.schema,
    operation: 'delete',
    // Remove strange symbol key
    old: { ...pgoMsg.old },
    occuredAt: commitTime,
  }
}

export type TransactionPgoMessage =
  | Pgoutput.MessageBegin
  | Pgoutput.MessageCommit

export const wrapPgoMessage = (
  listener: (
    lsn: string,
    commitedAt: Date,
    log: Exclude<Pgoutput.Message, TransactionPgoMessage>,
  ) => Promise<void> | void,
) => {
  let lastTxTime: Date | null

  return async (lsn: string, log: unknown): Promise<void> => {
    const msg = log as Pgoutput.Message

    if (isBeginTransactionPgoMessage(msg)) {
      lastTxTime = commitTimeToDate(msg.commitTime)
      return
    }

    if (isCommitTransactionPgoMessage(msg)) {
      lastTxTime = null
      return
    }

    if (lastTxTime == null) {
      console.warn(`Ignoring message without transaction begin ${msg.tag}`)
      return
    }

    return await listener(lsn, lastTxTime, msg)
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const commitTimeToDate = (commitTime: BigInt) =>
  µsToDate(commitTime as bigint)
