import { appEnv } from '../../common/env/app-env'
import { createReplSlot } from './_repl-slot'

void createReplSlot(appEnv.DATABASE_REPL_SLOT_NAME, 'pgoutput')
