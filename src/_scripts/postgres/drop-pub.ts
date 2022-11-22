import { appEnv } from '../../common/env/app-env'
import { dropPublication } from './_publication'

void dropPublication(appEnv.DATABASE_REPL_PUB_NAME)
