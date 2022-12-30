import { appEnv } from './env/app-env'
import express from 'express'
import http from 'http'

const app = express()
const server = http.createServer(app)

app.use(express.json())

let shouldWork = false

const go = async () => {
  app.post('/on-webhook', (req, res) => {
    // Simulate random failures 1 times / 2
    shouldWork = !shouldWork

    console.info(`Received event ${JSON.stringify(req.body)}`)

    if (!shouldWork) {
      console.info(`Simulating error reply from webhook`)
      res.status(500).json(null)
      return
    }

    console.info(`Simulating success reply from webhook`)
    res.status(200).json(null)
  })

  server.listen(appEnv.RECEIVER_PORT, () =>
    console.info(`Magic happens on port ${appEnv.RECEIVER_PORT}`),
  )
  await new Promise((resolve, reject) => {
    server.on('close', resolve)
    server.on('error', reject)
  })
}

void go().then().catch(console.error)
