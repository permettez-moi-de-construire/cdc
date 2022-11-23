import { createQueue } from './_amqp-objects'
import { mgmtEnv } from '../env/mgmt-env'

void createQueue(mgmtEnv, mgmtEnv.AMQP_CONSUME_QUEUE)
