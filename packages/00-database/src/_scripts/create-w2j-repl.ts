import { mgmtEnv } from '../env/mgmt-env'
import { createReplSlot } from './_repl-slot'

void createReplSlot(mgmtEnv.DATABASE_REPL_WAL2JSON_SLOT_NAME, 'wal2json')
