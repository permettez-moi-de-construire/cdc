import { mgmtEnv } from '../env/mgmt-env'
import { createReplSlot } from './_repl-slot'

void createReplSlot(mgmtEnv.DATABASE_REPL_PGOUTPUT_SLOT_NAME, 'pgoutput')
