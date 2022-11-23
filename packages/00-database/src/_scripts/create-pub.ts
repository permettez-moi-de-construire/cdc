import { mgmtEnv } from '../env/mgmt-env'
import { createPublication } from './_publication'

void createPublication(mgmtEnv.DATABASE_REPL_PUB_NAME)
