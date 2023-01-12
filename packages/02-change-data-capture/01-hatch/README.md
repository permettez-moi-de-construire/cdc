[← Theia / 03-change-data-capture](/packages/02-change-data-capture)

# Theia / 03-change-data-capture / 01-hatch

This component is responsible of
- watching database changes
- parsing, filtering, formatting them
- and wrapping them in AMQP events

## Launching

See [workspace scripts](/README.md#workspace-scripts) for general run instructions.

Available package local scripts :
- `yarn dev` : run and watch for development
- `yarn start` : run for production
- `yarn lint` / `yarn fix` / `yarn format` : code linting & cleaning

## Behavior

![theia-cdc-hatch](https://user-images.githubusercontent.com/10728426/212117992-16c37335-d0b7-4095-af47-62d7d1105879.png)

### Watching database changes

The main technology used is a Postgres feature called [Logical Replication Decoding](https://www.postgresql.org/docs/current/logical-replication.html).
You can read [this introduction](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html#:~:text=A%20replication%20slot%20has%20an,just%20once%20in%20normal%20operation.) to understand the base concepts.
In a nutshell, Postgres maintains an internal replica directly logging every operations ran inside a database
to the WAL [Write Ahead Log](https://www.postgresql.org/docs/current/wal-intro.html).
The WAL is then accessed through the native Postgres Logical Decoding Plugin [`pgoutput`](https://github.com/postgres/postgres/tree/master/src/backend/replication/pgoutput) pluging for maximum compatibility.

Learn more about the needed database setup in [00-database](/packages/00-database#logical-replication) package documentation. See [workspace scripts](/README.md#workspace-scripts) for general setup instructions,
or digg inside [00-database](/packages/00-database) internal scripts for details.

This package is using the excellent library [`pg-logical-replication`](https://github.com/kibae/pg-logical-replication) to read from the WAL as a stream.

### Parsing, filtering, formatting changes

Read the code in [`src/wal/pgoutput-message.ts`](src/wal/pgoutput-message.ts) to understand the input logic.

### Wrapping changes in AMQP events

Read the code in [`src/index.ts`](src/index.ts) to understand the output logic.
