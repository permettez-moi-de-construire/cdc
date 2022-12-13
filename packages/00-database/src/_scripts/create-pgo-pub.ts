import { mgmtEnv } from '../env/mgmt-env'
import { createPublication } from './_publication'

void createPublication(
  mgmtEnv.DATABASE_REPL_PGOUTPUT_PUB_NAME,
  mgmtEnv.DATABASE_OPERATIONAL_SCHEMA,
)
