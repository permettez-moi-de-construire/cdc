# @algar/theia

***Theia*** (`θεια`) derives from the Greek goddess of truth [*Aletheia*](https://en.wikipedia.org/wiki/Aletheia).

> In Ancient Greek, the philosophical concept *Aletheia* commonly translates to "truth", "factuality" or "reality". The literal meaning of the word is "the state of not being hidden; the state of being evident."

This repository is meant to be (at least) the new revamped data-stack for [Algar](https://algar.co), aka "Source of Truth".

## Architecture

### Logical

The project is divided into several blocks that can be presented as follow :
![theia-logical](https://user-images.githubusercontent.com/10728426/212053984-0e7f50e1-1a3a-4b6c-87fe-f375c18740ea.png)

3 main blocks here, with their components :
- **CDS** (Change Data Source) : connecting to "Data Sources", and watching their changes
  - Receiver : receiving changes from sources through webhooks, and inserting raw change events data into Database
- **CDP** (Change Data Pipeline) : handling change events to prepare and unify data
  - Pipeline : scanning change events to process them and building successively prepared and unified data into Database
- **CDC** (Change Data Capture) : capturing unified data change events, and dispatching them to data handlers
  - Hatch : scanning database changes and emitting clean change events through AMQP
  - Webhooks : scanning AMQP change events and emitting webhooks for data handlers

### Repository

The project is designed as a monorepo using [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/)

The blocks and components are located inside [`packages`](./packages) directory :
- [`packages` / `00-amqp`](./packages/00-amqp) : thin wrapper around [amqp-connector](https://github.com/permettez-moi-de-construire/amqp-connector). It provides the base exchanges, queues, env and utils to manipulate the queuing system. It's meant to
  - Provide management scripts to initialize the AMQP instance
  - Be imported as a dependency in packages manipulating AMQP
- [`packages` / `00-common`](./packages/00-common) : various common utils used throughout the whole project. It's meant to be imported as a dependency in other packages when needed.
- [`packages` / `00-database`](./packages/00-database) : thin wrapper around [prisma](https://www.prisma.io/). It provides the models, env and utils to manipulate the database. It's meant to
  - Provide management scripts to initialize the database instance
  - Be imported as a dependency in packages manipulating database
- [`packages` / `01-datasources`](./packages/01-datasources) : the CDS block with its components
  - [`packages` / `01-datasources` / `01-receiver`](./packages/01-datasources/01-receiver) : CDS receiver, see [logical architecture](#logical) above. It's meant to be launched as a script.
- [`packages` / `03-change-data-capture`](./packages/02-change-data-capture) : the CDC block with its components
  - [`packages` / `03-change-data-capture` / `01-hatch`](./packages/02-change-data-capture/01-hatch) : CDC hatch, see [logical architecture](#logical) above. It's meant to be launched as a script.
  - [`packages` / `03-change-data-capture` / `02-dispatcher`](./packages/02-change-data-capture/02-webhooks) : CDC webhooks dispatcher, see [logical architecture](#logical) above. It's meant to be launched as a script.

# Workspace scripts
TODO

# General troubleshooting

### Hoisting
Libraries like [prisma](https://www.prisma.io/) [generate some code inside `node_modules`](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client) (outside of their own folder). This pattern is known to cause conflict issues with yarn workspaces. Thus, they should be ommited from hoisting mecanism with [`workspaces.nohoist` key in package.json](./package.json)

### Various yarn strange issues
Traveling the web you will find some commands for workspace management, mostly the ones starting with `yarn workspaces` (like `yarn workspaces foreach`). Those are only available with recent versions of yarn (2.X, 3.X) which are not used here.
