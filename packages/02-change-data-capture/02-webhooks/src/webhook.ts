import { ConsumeJsonMessage } from '@permettezmoideconstruire/amqp-connector'
import { Webhook } from '@prisma/client'
import axios from 'axios'

const callWebhook = (webhook: Webhook) => async (msg: ConsumeJsonMessage) => {
  await axios.post(webhook.url, msg.content)
  // Do something
}

export { callWebhook }
