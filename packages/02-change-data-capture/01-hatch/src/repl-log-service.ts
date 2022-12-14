import {
  LogicalReplicationService,
  PgoutputPlugin,
  Wal2JsonPlugin,
  Wal2JsonPluginOptions,
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
  } as Wal2JsonPluginOptions),
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
  includeSchemas: true,
  includeTypes: true,
  // includeLsn: true,
  includePk: true,
  includeTransaction: false,
  // writeInChunks: true,
})

export { listeningService, pgOutputPlugin, wal2JsonV1Plugin, wal2JsonPlugin }
