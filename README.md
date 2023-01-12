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

The project is designed as a monorepo
