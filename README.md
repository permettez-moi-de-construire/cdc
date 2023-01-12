# @algar/theia

***Theia*** (`θεια`) derives from [*Aletheia*](https://en.wikipedia.org/wiki/Aletheia) (`ἀ–λήθεια`), the Greek goddess of truth.

> In Ancient Greek, the philosophical concept *Aletheia* commonly translates to "truth", "factuality" or "reality". The literal meaning of the word is "the state of not being hidden; the state of being evident."

This repository is meant to be (at least) the new revamped data-stack for [Algar](https://algar.co).

## Architecture

### Logical

The project is divided into several blocks that can be presented as follow :
![theia-logical](https://user-images.githubusercontent.com/10728426/212053984-0e7f50e1-1a3a-4b6c-87fe-f375c18740ea.png)

3 main blocks here, with their sub-blocks :
- **CDS** (Change Data Source) : connecting to "Data Sources", and watching their changes
  - Receiver : receiving changes from sources through webhooks, and inserting raw change events data into Database
- **CDP** (Change Data Pipeline) : handling change events to prepare and unify data
  - Pipeline : scanning change events to process them and building successively prepared and unified data into Database
- **CDC** (Change Data Capture) : capturing unified data change events, and dispatching them to data handlers
  - Hatch : scanning database changes and emitting clean change events through AMQP
  - Webhooks : scanning AMQP change events and emitting webhooks for data handlers

### Repository

The project is designed as a monorepo using [yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) with yarn v1.X

# General troubleshooting

### Hoisting
Libraries like [prisma](https://www.prisma.io/) [generate some code inside `node_modules`](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client) (outside of their own folder). This pattern is known to cause conflict issues with yarn workspaces. Thus, they should be ommited from hoisting mecanism with [`workspaces.nohoist` key in package.json](https://github.com/permettez-moi-de-construire/theia/blob/master/package.json)

### Various yarn strange issues
Traveling the web you will find some commands for workspace management, mostly the ones starting with `yarn workspaces` (like `yarn workspaces foreach`). Those are only available with recent versions of yarn (2.X, 3.X) which are not used here.
