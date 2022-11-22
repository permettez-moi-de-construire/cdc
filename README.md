# pg-amqp-poc

## Preparing
- `docker-compose up` at root
- `nvm use`
- ```bash
  yarn db:migrate
  yarn dbq:prepare
  yarn amqp:prepare
  ```

## Starting
- Open 3 terminals at root
- `yarn dev:consume`
- `yarn dev:log`
- `yarn dev:simulate`
