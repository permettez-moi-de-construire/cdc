import { mgmtEnv } from '../env/mgmt-env'
import { dropReplSlot } from './_repl-slot'

void dropReplSlot(mgmtEnv.DATABASE_REPL_SLOT_NAME)
