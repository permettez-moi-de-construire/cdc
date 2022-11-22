import { createQueue } from './_amqp-objects'
import { mgmtEnv } from '../../common/env/mgmt-env'

void createQueue(mgmtEnv, mgmtEnv.AQMP_CONSUME_QUEUE)
