import { parse as parseDate } from 'date-fns'
import {
  Wal2JsonColumn,
  Wal2JsonDeleteMessageV2,
  Wal2JsonInsertMessageV2,
  Wal2JsonMessageV2,
  Wal2JsonTruncateMessageV2,
  Wal2JsonUpdateMessageV2,
} from './repl-log-service'

type _Wal2JsonBaseObjectV2 = {
  eventId: string
  occuredAt: Date
  table: string
}

type Wal2JsonInsertObjectV2 = _Wal2JsonBaseObjectV2 & {
  operation: 'insert'
  key: Record<string, unknown>
  new: Record<string, unknown>
  old: null
  changes: Record<string, unknown>
}

type Wal2JsonUpdateObjectV2 = _Wal2JsonBaseObjectV2 & {
  operation: 'update'
  key: Record<string, unknown>
  new: Record<string, unknown>
  old: Record<string, unknown>
  changes: Record<string, unknown>
}

type Wal2JsonDeleteObjectV2 = _Wal2JsonBaseObjectV2 & {
  operation: 'delete'
  key: Record<string, unknown>
  new: null
  old: Record<string, unknown>
  changes: null
}

type Wal2JsonTruncateObjectV2 = _Wal2JsonBaseObjectV2 & {
  operation: 'truncate'
  key: null
  new: null
  old: null
  changes: null
}

export type Wal2JsonObjectV2 =
  | Wal2JsonInsertObjectV2
  | Wal2JsonUpdateObjectV2
  | Wal2JsonDeleteObjectV2
  | Wal2JsonTruncateObjectV2

const objectifyMessageV2 = (
  msg: Wal2JsonMessageV2,
  id: string,
): Wal2JsonObjectV2 => {
  switch (msg.action) {
    case 'I':
      return objectifyInsertMessageV2(msg, id)
    case 'U':
      return objectifyUpdateMessageV2(msg, id)
    case 'D':
      return objectifyDeleteMessageV2(msg, id)
    case 'T':
      return objectifyTruncateMessageV2(msg, id)
  }
}

const objectifyInsertMessageV2 = (
  msg: Wal2JsonInsertMessageV2,
  id: string,
): Wal2JsonInsertObjectV2 => {
  const columns = msg.columns.reduce(columnsToObject, {}) ?? null
  const pk = objectifyKey(msg.pk, columns)

  return {
    eventId: id,
    table: msg.table,
    occuredAt: serializeTimestamp(msg.timestamp),
    operation: actionToOperation[msg.action],
    key: pk,
    new: columns,
    old: null,
    changes: columns,
  }
}

const objectifyUpdateMessageV2 = (
  msg: Wal2JsonUpdateMessageV2,
  id: string,
): Wal2JsonUpdateObjectV2 => {
  const columns = msg.columns.reduce(columnsToObject, {}) ?? null
  const identity = msg.identity.reduce(columnsToObject, {}) ?? null
  const pk = objectifyKey(msg.pk, columns)
  const changes = objectifyChanges(msg.identity, msg.columns)

  return {
    eventId: id,
    table: msg.table,
    occuredAt: serializeTimestamp(msg.timestamp),
    operation: actionToOperation[msg.action],
    key: pk,
    new: columns,
    old: identity,
    changes,
  }
}

const objectifyDeleteMessageV2 = (
  msg: Wal2JsonDeleteMessageV2,
  id: string,
): Wal2JsonDeleteObjectV2 => {
  const identity = msg.identity.reduce(columnsToObject, {}) ?? null
  const pk = objectifyKey(msg.pk, identity)

  return {
    eventId: id,
    table: msg.table,
    occuredAt: serializeTimestamp(msg.timestamp),
    operation: actionToOperation[msg.action],
    key: pk,
    new: null,
    old: identity,
    changes: null,
  }
}

const objectifyTruncateMessageV2 = (
  msg: Wal2JsonTruncateMessageV2,
  id: string,
): Wal2JsonTruncateObjectV2 => {
  return {
    eventId: id,
    table: msg.table,
    occuredAt: serializeTimestamp(msg.timestamp),
    operation: actionToOperation[msg.action],
    key: null,
    new: null,
    old: null,
    changes: null,
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

const objectifyKey = (
  rawPk: Omit<Wal2JsonColumn, 'value'>[],
  refColumns: Record<string, unknown>,
) => {
  const key = rawPk.map(({ name }) => name)
  const pk = Object.fromEntries(
    Object.entries(refColumns).filter(([k]) => key.includes(k)),
  )
  return pk
}

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

export { objectifyMessageV2 }
