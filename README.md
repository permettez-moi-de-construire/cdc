# @algar/theia

***Theia*** (`θεια`) derives from [*Aletheia*](https://en.wikipedia.org/wiki/Aletheia) (`ἀ–λήθεια`), the Greek goddess of truth.

> In Ancient Greek, the philosophical concept *Aletheia* commonly translates to "truth", "factuality" or "reality". The literal meaning of the word is "the state of not being hidden; the state of being evident."

This repository is meant to be (at least) the new revamped data-stack for [Algar](https://algar.co).

## Architecture

### Conceptual

The project is divided into several blocks that can be presented as follow :

### Logical

It's designed as a monorepo 

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
