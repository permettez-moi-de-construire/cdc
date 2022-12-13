import { mgmtEnv } from '../env/mgmt-env'
import { dropPublication } from './_publication'

void dropPublication(mgmtEnv.DATABASE_REPL_PGOUTPUT_PUB_NAME)
