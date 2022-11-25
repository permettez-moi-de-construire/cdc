import { Wal2Json } from 'pg-logical-replication'
import { parse as parseDate } from 'date-fns'

const serializeChange = (
  msg: Wal2Json.Change,
  messageId: string,
  timestamp: string,
) => {
  let occuredAt = parseLogDateWithTz(timestamp, 6)
  if (!isFinite(+occuredAt)) {
    console.warn(`Error parsing timestamp ${timestamp}. Defaulting to now().`)
    occuredAt = new Date(Date.now())
  }

  switch (msg.kind) {
    case 'insert':
      return {
        eventId: messageId,
        occuredAt,
        ...serializeInsert(msg),
      }
    case 'update':
      return {
        eventId: messageId,
        occuredAt,
        ...serializeUpdate(msg),
      }
    case 'delete':
      return {
        eventId: messageId,
        occuredAt,
        ...serializeDelete(msg),
      }
    default:
      throw new TypeError(`Unsupported operation ${msg.kind}`)
  }
}

const serializeInsert = (msg: Wal2Json.Change) => {
  const data = msg.columnnames.reduce(
    (acc, k, i) => ({
      ...acc,
      [k]: serializeCol(msg.columntypes[i], msg.columnvalues[i]),
    }),
    {},
  )

  return {
    table: msg.table,
    operation: msg.kind,
    key: Object.fromEntries(
      Object.entries(data).filter(
        ([k]) => msg.pk?.pknames.includes(k) ?? false,
      ),
    ),
    new: data,
  }
}

const serializeUpdate = (msg: Wal2Json.Change) => {
  const data = msg.columnnames.reduce(
    (acc, k, i) => ({
      ...acc,
      [k]: serializeCol(msg.columntypes[i], msg.columnvalues[i]),
    }),
    {},
  )

  return {
    table: msg.table,
    operation: msg.kind,
    key: Object.fromEntries(
      Object.entries(data).filter(
        ([k]) => msg.pk?.pknames.includes(k) ?? false,
      ),
    ),
    new: data,
  }
}

const serializeDelete = (msg: Wal2Json.Change) => {
  const oldkeys = (msg as any).oldkeys as {
    keynames: string[]
    keytypes: string[]
    keyvalues: string[]
  }

  const key = oldkeys.keynames.reduce(
    (acc, k, i) => ({
      ...acc,
      [k]: serializeCol(oldkeys.keytypes[i], oldkeys.keyvalues[i]),
    }),
    {},
  )

  return {
    table: msg.table,
    operation: msg.kind,
    key: key,
    new: key,
  }
}

const TIMESTAMP_REGEX =
  /^timestamp(?:\((?<fractions>\d+)\))?(?: without time zone)?$/
const TIMESTAMPTZ_REGEX = /^timestamptz(?:\((?<fractions>\d+)\))?$/
const TIMESTAMPTZ_FULL_REGEX =
  /^timestamp(?:\((?<fractions>\d+)\))?(?: with time zone)$/
const serializeCol = (type: string, value: unknown) => {
  const timestampMatch = type.match(TIMESTAMP_REGEX)
  if (timestampMatch != null) {
    const fractions =
      timestampMatch.groups?.fractions != null
        ? parseInt(timestampMatch.groups?.fractions)
        : 0

    return parseLogSimpleDate(value as string, fractions)
  }

  const timestamptzSimpleMatch = type.match(TIMESTAMPTZ_REGEX)
  const timestamptzFullMatch = type.match(TIMESTAMPTZ_FULL_REGEX)
  const timestamptzMatch = [timestamptzSimpleMatch, timestamptzFullMatch].find(
    (m) => m != null,
  )
  if (timestamptzMatch != null) {
    const fractions =
      timestamptzMatch.groups?.fractions != null
        ? parseInt(timestamptzMatch.groups?.fractions)
        : 0

    return parseLogDateWithTz(value as string, fractions)
  }

  return value
}

const parseLogDateWithTz = (d: string, fractions = 0) =>
  parseDate(d, `yyyy-LL-dd HH:mm:ss.${'S'.repeat(fractions)}x`, new Date())

const parseLogSimpleDate = (d: string, fractions = 0) =>
  parseDate(
    `${d}+00`,
    `yyyy-LL-dd HH:mm:ss.${'S'.repeat(fractions)}x`,
    new Date(),
  )

export {
  parseLogDateWithTz,
  serializeChange,
  serializeInsert,
  serializeUpdate,
  serializeDelete,
}
