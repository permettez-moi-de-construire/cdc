# pg-amqp-poc

## Preparing
- `docker-compose up` at root
- `nvm use`
- ```bash
  yarn generate:db
  yarn generate:webhook
  yarn migrate:db
  yarn prepare:dbq
  yarn prepare:amqp
  ```

## Starting
- Open 4 terminals at root
- `yarn dev:receiver`
- `yarn dev:webhooks`
- `yarn dev:cdc`
- `yarn dev:activity`
