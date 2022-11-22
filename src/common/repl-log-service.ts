import {
  LogicalReplicationService,
  PgoutputPlugin,
} from 'pg-logical-replication'
import { appEnv } from '../common/env/app-env'

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

export { listeningService, pgOutputPlugin }
