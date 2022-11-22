import { dropQueue } from './_amqp-objects'
import { mgmtEnv } from '../../common/env/mgmt-env'

void dropQueue(mgmtEnv, mgmtEnv.AQMP_CONSUME_QUEUE)
