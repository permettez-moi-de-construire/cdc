[← Theia / 03-change-data-capture](/packages/02-change-data-capture)

# Theia / 03-change-data-capture / 01-hatch

This component is responsible of
- exposing a simple webhooks API (subscribe / unsubscribe)
- consuming AMQP events of the hatch and posting them to webhooks subscribers

## Launching

See [workspace scripts](/README.md#workspace-scripts) for general run instructions.

Available package local scripts :
- `yarn dev` : run and watch for development
- `yarn start` : run for production
- `yarn lint` / `yarn fix` / `yarn format` : code linting & cleaning

## Behavior

![theia-cdc-dispatcher](https://user-images.githubusercontent.com/10728426/212126289-e04292dc-a98d-4211-b82d-3310c5639c09.png)

### API

🚧 TODO: generate with OpenAPI using zod

On each subscription, a Webhook record is inserted in database and a Queue is created.

### Post

Each webhook subscription Queue is consumed. When an event incomes, the underlying webhook is called.

See [api](#api) for the payload schema.

### Retry

On Post failure, message is marked as "to retry". It will be successively retried several times,
with an increasing delay each time defined in `AMQP_REQUEUE_DELAYS` environment variable.

Read [this article](https://devcorner.digitalpress.blog/rabbitmq-retries-the-new-full-story/) to deeply understand the mecanism.
