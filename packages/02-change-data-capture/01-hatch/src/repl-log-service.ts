import {
  LogicalReplicationService,
  PgoutputPlugin,
  Wal2JsonPlugin,
} from 'pg-logical-replication'
import { appEnv } from './env/app-env'

const listeningService = new LogicalReplicationService(
  {
    connectionString: appEnv.DATABASE_URL,
  },
  {
    acknowledge: {
      auto: true,
      timeoutSeconds: 10,
    },
  },
)

const pgOutputPlugin = new PgoutputPlugin({
  protoVersion: 2,
  publicationNames: [appEnv.DATABASE_REPL_PGOUTPUT_PUB_NAME],
  ...({
    includeXids: true,
    includeTimestamp: true,
    includeSchemas: false,
    includeTypes: true,
    // includeLsn: true,
    includePk: true,
    includeTransaction: false,
  } as any)
})

const wal2JsonV1Plugin = new Wal2JsonPlugin({
  formatVersion: '1',
  includeTimestamp: true,
  includeSchemas: false,
  includeTypes: true,
  includeLsn: true,
  includePk: true,
  // writeInChunks: true,
})

const wal2JsonPlugin = new Wal2JsonPlugin({
  formatVersion: '2',
  includeXids: true,
  includeTimestamp: true,
  includeSchemas: false,
  includeTypes: true,
  // includeLsn: true,
  includePk: true,
  includeTransaction: false,
  // writeInChunks: true,
})

type Wal2JsonColumn = {
  name: string
  type: string
  value: string
}

type _Wal2JsonBaseMessageV2 = {
  timestamp: string
  table: string
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

export { listeningService, pgOutputPlugin, wal2JsonV1Plugin, wal2JsonPlugin }
export type {
  Wal2JsonColumn,
  Wal2JsonInsertMessageV2,
  Wal2JsonUpdateMessageV2,
  Wal2JsonDeleteMessageV2,
  Wal2JsonTruncateMessageV2,
}
