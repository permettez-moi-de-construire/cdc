export type CDCBaseMessage = {
  eventId: string
  occuredAt: Date
  table: string
  schema: string
}

export type CDCInsertMessage = CDCBaseMessage & {
  operation: 'insert'
  key: Record<string, unknown>
  new: Record<string, unknown>
  old: null
  changes: Record<string, unknown>
}

export type CDCUpdateMessage = CDCBaseMessage & {
  operation: 'update'
  key: Record<string, unknown>
  new: Record<string, unknown>
  old: Record<string, unknown>
  changes: Record<string, unknown>
}

export type CDCDeleteMessage = CDCBaseMessage & {
  operation: 'delete'
  key: Record<string, unknown>
  new: null
  old: Record<string, unknown>
  changes: null
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
