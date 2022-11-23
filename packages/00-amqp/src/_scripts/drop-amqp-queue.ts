import { dropQueue } from './_amqp-objects'
import { mgmtEnv } from '../env/mgmt-env'

void dropQueue(mgmtEnv, mgmtEnv.AMQP_CONSUME_QUEUE)
