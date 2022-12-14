import { parse as parseDate } from 'date-fns'
import {
  CDCDeleteMessage,
  CDCInsertMessage,
  CDCMessageV2,
  CDCUpdateMessage,
} from '../cdc-message'
import { Wal2Json } from 'pg-logical-replication'

type Wal2JsonColumn = {
  name: string
  type: string
  value: string
}

type _Wal2JsonBaseMessageV2 = Wal2Json.Change & {
  timestamp: string
  table: string
  schema: string
}

type Wal2JsonInsertMessageV2 = _Wal2JsonBaseMessageV2 & {
  action: 'I'
  pk: Omit<Wal2JsonColumn, 'value'>[]
  columns: Wal2JsonColumn[]
  identity: undefined
}

type Wal2JsonUpdateMessageV2 = _Wal2JsonBaseMessageV2 & {
  action: 'U'
  pk: Omit<Wal2JsonColumn, 'value'>[]
  columns: Wal2JsonColumn[]
  identity: Wal2JsonColumn[]
}

type Wal2JsonDeleteMessageV2 = _Wal2JsonBaseMessageV2 & {
  action: 'D'
  pk: Omit<Wal2JsonColumn, 'value'>[]
  columns: undefined
  identity: Wal2JsonColumn[]
}

type Wal2JsonTruncateMessageV2 = _Wal2JsonBaseMessageV2 & {
  action: 'T'
  pk: undefined
  columns: undefined
  identity: undefined
}

export type Wal2JsonMessageV2 =
  | Wal2JsonInsertMessageV2
  | Wal2JsonUpdateMessageV2
  | Wal2JsonDeleteMessageV2
  | Wal2JsonTruncateMessageV2

export type Wal2JsonSupportedMessageV2 =
  | Wal2JsonInsertMessageV2
  | Wal2JsonUpdateMessageV2
  | Wal2JsonDeleteMessageV2

export const isSupportedW2jMessage = (
  w2j: Wal2Json.Change,
): w2j is Wal2JsonSupportedMessageV2 => {
  switch (w2j.kind) {
    case 'insert':
    case 'update':
    case 'delete':
      return true
    default:
      return false
  }
}

export const w2jMessageToCDCMessage = (
  msg: Wal2JsonSupportedMessageV2,
  id: string,
): CDCMessageV2 => {
  switch (msg.action) {
    case 'I':
      return w2jInsertMessageToCDCInsertMessage(msg, id)
    case 'U':
      return w2jUpdateMessageToCDCUpdateMessage(msg, id)
    case 'D':
      return w2jDeleteMessageToCDCDeleteMessage(msg, id)
  }
}

const w2jInsertMessageToCDCInsertMessage = (
  msg: Wal2JsonInsertMessageV2,
  id: string,
): CDCInsertMessage => {
  const columns = msg.columns.reduce(columnsToObject, {}) ?? null

  return {
    eventId: id,
    schema: msg.schema,
    table: msg.table,
    occuredAt: serializeTimestamp(msg.timestamp),
    operation: actionToOperation[msg.action],
    new: columns,
  }
}

const w2jUpdateMessageToCDCUpdateMessage = (
  msg: Wal2JsonUpdateMessageV2,
  id: string,
): CDCUpdateMessage => {
  const columns = msg.columns.reduce(columnsToObject, {}) ?? null
  const identity = msg.identity.reduce(columnsToObject, {}) ?? null
  const changes = objectifyChanges(msg.identity, msg.columns)

  return {
    eventId: id,
    schema: msg.schema,
    table: msg.table,
    occuredAt: serializeTimestamp(msg.timestamp),
    operation: actionToOperation[msg.action],
    new: columns,
    old: identity,
    changes,
  }
}

const w2jDeleteMessageToCDCDeleteMessage = (
  msg: Wal2JsonDeleteMessageV2,
  id: string,
): CDCDeleteMessage => {
  const identity = msg.identity.reduce(columnsToObject, {}) ?? null

  return {
    eventId: id,
    schema: msg.schema,
    table: msg.table,
    occuredAt: serializeTimestamp(msg.timestamp),
    operation: actionToOperation[msg.action],
    old: identity,
  }
}

const actionToOperation = {
  I: 'insert',
  U: 'update',
  D: 'delete',
  T: 'truncate',
  B: 'begin',
  C: 'commit',
} as const

const objectifyChanges = (
  identityColumns: Wal2JsonColumn[],
  columns: Wal2JsonColumn[],
) => {
  const changesColumns = columns.filter(
    ({ name: k1, value: v1 }) =>
      identityColumns.find(({ name: k2 }) => k1 === k2)?.value !== v1,
  )
  const changes = changesColumns.reduce(columnsToObject, {})
  return changes
}

const columnsToObject = (
  acc: Record<string, unknown>,
  column: Wal2JsonColumn,
) => ({
  ...acc,
  [column.name]: serializeCol(column),
})

const serializeTimestamp = (timestamp: string) => {
  let occuredAt = parseLogDateWithTz(timestamp, 6)
  if (!isFinite(+occuredAt)) {
    console.warn(`Error parsing timestamp ${timestamp}. Defaulting to now().`)
    occuredAt = new Date(Date.now())
  }

  return occuredAt
}

const TIMESTAMP_REGEX =
  /^timestamp(?:\((?<fractions>\d+)\))?(?: without time zone)?$/
const TIMESTAMPTZ_REGEX = /^timestamptz(?:\((?<fractions>\d+)\))?$/
const TIMESTAMPTZ_FULL_REGEX =
  /^timestamp(?:\((?<fractions>\d+)\))?(?: with time zone)$/
const serializeCol = (column: Wal2JsonColumn) => {
  const timestampMatch = column.type.match(TIMESTAMP_REGEX)
  if (timestampMatch != null) {
    const fractions =
      timestampMatch.groups?.fractions != null
        ? parseInt(timestampMatch.groups?.fractions)
        : 0

    return parseLogSimpleDate(column.value, fractions)
  }

  const timestamptzSimpleMatch = column.type.match(TIMESTAMPTZ_REGEX)
  const timestamptzFullMatch = column.type.match(TIMESTAMPTZ_FULL_REGEX)
  const timestamptzMatch = [timestamptzSimpleMatch, timestamptzFullMatch].find(
    (m) => m != null,
  )
  if (timestamptzMatch != null) {
    const fractions =
      timestamptzMatch.groups?.fractions != null
        ? parseInt(timestamptzMatch.groups?.fractions)
        : 0

    return parseLogDateWithTz(column.value, fractions)
  }

  return column.value
}

const parseLogDateWithTz = (d: string, fractions = 0) =>
  parseDate(d, `yyyy-LL-dd HH:mm:ss.${'S'.repeat(fractions)}x`, new Date())

const parseLogSimpleDate = (d: string, fractions = 0) =>
  parseDate(
    `${d}+00`,
    `yyyy-LL-dd HH:mm:ss.${'S'.repeat(fractions)}x`,
    new Date(),
  )
