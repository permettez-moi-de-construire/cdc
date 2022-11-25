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
  publicationNames: [appEnv.DATABASE_REPL_PUB_NAME],
})

const wal2JsonPlugin = new Wal2JsonPlugin({
  formatVersion: '1',
  includeTimestamp: true,
  includeSchemas: false,
  includeTypes: true,
  includeLsn: true,
  includePk: true,
  // writeInChunks: true,
})

export { listeningService, pgOutputPlugin, wal2JsonPlugin }
