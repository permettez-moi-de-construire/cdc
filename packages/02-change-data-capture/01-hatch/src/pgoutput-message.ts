import { Pgoutput } from 'pg-logical-replication'
import {
  CDCDeleteMessage,
  CDCInsertMessage,
  CDCMessageV2,
  CDCUpdateMessage,
} from './cdc-message'

export const supportedPgoMessageTags = ['insert', 'update', 'delete'] as const
export type SupportedPgoMessageTag = typeof supportedPgoMessageTags[number]
export type SupportedPgoMessage =
  | Pgoutput.MessageInsert
  | Pgoutput.MessageUpdate
  | Pgoutput.MessageDelete

export const isSupportedPgoMessage = (
  pgoMsg: Pgoutput.Message,
): pgoMsg is SupportedPgoMessage => supportedPgoMessageTags.includes((pgoMsg as SupportedPgoMessage).tag)

export const pgoMessageToCDCMessage = (
  pgoMsg: SupportedPgoMessage,
  eventId: string,
): CDCMessageV2 => {
  switch (pgoMsg.tag) {
    case 'insert':
      return pgoInsertMessageToCDCInsertMessage(pgoMsg, eventId)
    case 'update':
      return pgoUpdateMessageToCDCUpdateMessage(pgoMsg, eventId)
    case 'delete':
      return pgoDeleteMessageToCDCDeleteMessage(pgoMsg, eventId)
  }
}

export const pgoInsertMessageToCDCInsertMessage = (
  pgoMsg: Pgoutput.MessageInsert,
  eventId: string,
): CDCInsertMessage => {
  return {
    eventId,
    table: pgoMsg.relation.name,
    schema: pgoMsg.relation.schema,
    operation: 'insert',
    changes: pgoMsg.new,
    new: pgoMsg.new,
    old: null,
    // TODO: fix
    key: {},
    // TODO: fix
    occuredAt: new Date(Date.now()),
  }
}

export const pgoUpdateMessageToCDCUpdateMessage = (
  pgoMsg: Pgoutput.MessageUpdate,
  eventId: string,
): CDCUpdateMessage => {
  return {
    eventId,
    table: pgoMsg.relation.name,
    schema: pgoMsg.relation.schema,
    operation: 'update',
    // TODO: fix
    changes: pgoMsg.new,
    new: pgoMsg.new,
    // TODO: better check
    old: pgoMsg.old!,
    // TODO: fix
    key: {},
    // TODO: fix
    occuredAt: new Date(Date.now()),
  }
}

export const pgoDeleteMessageToCDCDeleteMessage = (
  pgoMsg: Pgoutput.MessageDelete,
  eventId: string,
): CDCDeleteMessage => {
  return {
    eventId,
    table: pgoMsg.relation.name,
    schema: pgoMsg.relation.schema,
    operation: 'delete',
    // TODO: fix
    changes: null,
    new: null,
    // TODO: better check
    old: pgoMsg.old!,
    // TODO: fix
    key: {},
    // TODO: fix
    occuredAt: new Date(Date.now()),
  }
}
