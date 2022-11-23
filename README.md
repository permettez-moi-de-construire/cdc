# pg-amqp-poc

## Preparing
- `docker-compose up` at root
- `nvm use`
- ```bash
  yarn migrate:db
  yarn prepare:dbq
  yarn prepare:amqp
  ```

## Starting
- Open 3 terminals at root
- `yarn dev:consume`
- `yarn dev:passthrough`
- `yarn dev:simulate`
