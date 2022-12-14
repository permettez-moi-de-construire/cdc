import { Pgoutput } from 'pg-logical-replication'
import {
  CDCDeleteMessage,
  CDCInsertMessage,
  CDCMessageV2,
  CDCUpdateMessage,
} from './cdc-message'
import { µsToDate, compileShallowChanges } from './util'

export const simpleDmlMessageTags = ['insert', 'update', 'delete'] as const
export const dmlPgoMessageTags = [...simpleDmlMessageTags, 'truncate'] as const

export type SimpleDmlPgoMessageTag = typeof simpleDmlMessageTags[number]
export type DmlPgoMessageTag = typeof dmlPgoMessageTags[number]

export type DmlPgoMessage =
  | Pgoutput.MessageInsert
  | Pgoutput.MessageUpdate
  | Pgoutput.MessageDelete
  | Pgoutput.MessageTruncate

export type SimpleDmlPgoMessage = Exclude<
  DmlPgoMessage,
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

export const isDmlPgoMessage = (
  pgoMsg: Pgoutput.Message,
): pgoMsg is DmlPgoMessage =>
  dmlPgoMessageTags.includes(pgoMsg.tag as DmlPgoMessageTag)

export const isSimpleDmlPgoMessage = (
  pgoMsg: Pgoutput.Message,
): pgoMsg is SimpleDmlPgoMessage =>
  simpleDmlMessageTags.includes(pgoMsg.tag as SimpleDmlPgoMessageTag)

export const isSupportedPgoMessage = (
  pgoMsg: SimpleDmlPgoMessage,
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

// eslint-disable-next-line @typescript-eslint/ban-types
export const commitTimeToDate = (commitTime: BigInt) =>
  µsToDate(commitTime as bigint)
