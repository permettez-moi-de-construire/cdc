import { mgmtEnv } from '../env/mgmt-env'
import { dropPublication } from './_publication'

void dropPublication(mgmtEnv.DATABASE_REPL_PUB_NAME)
