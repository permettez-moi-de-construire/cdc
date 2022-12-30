export type CDCBaseMessage = {
  eventId: string
  occurredAt: Date
  table: string
  schema: string
}

export type CDCInsertMessage = CDCBaseMessage & {
  operation: 'insert'
  new: Record<string, unknown>
}

export type CDCUpdateMessage = CDCBaseMessage & {
  operation: 'update'
  new: Record<string, unknown>
  old: Record<string, unknown>
  changes: Record<string, unknown>
}

export type CDCDeleteMessage = CDCBaseMessage & {
  operation: 'delete'
  old: Record<string, unknown>
}

// export type CDCTruncateMessage = CDCBaseMessage & {
//   operation: 'truncate'
//   key: null
//   new: null
//   old: null
//   changes: null
// }

export type CDCMessageV2 =
  | CDCInsertMessage
  | CDCUpdateMessage
  | CDCDeleteMessage
// | CDCTruncateMessage

export type CDCOperation = CDCMessageV2['operation']
