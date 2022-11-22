import { dropExchange } from './_amqp-objects'
import { mgmtEnv } from '../../common/env/mgmt-env'

void dropExchange(mgmtEnv, mgmtEnv.AMQP_PUBLISH_EXCHANGE)
