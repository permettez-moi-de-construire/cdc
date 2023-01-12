## Logical Replication

Thanks to the native `pgoutput` plugin, enabling Logical Replication is relatively simple.

The [00-database](/packages/00-database) package exposes scripts to initialize everything needed to this setup.
See [workspace scripts](/README.md#workspace-scripts) for general setup instructions,
or digg inside [00-database](/packages/00-database) internal scripts for details.

#### 1. Creating the Replication Slot

A [Replication Slot](https://www.postgresql.org/docs/15/logicaldecoding-explanation.html#LOGICALDECODING-REPLICATION-SLOTS)
is a binding between the WAL and a Logical Decoding Plugin.

Creation is made with [a script](/packages/00-database/src/_scripts/_repl-slot.ts) in [00-database](/packages/00-database) package.

#### 2. Creating a Publication
A [Publication](https://www.postgresql.org/docs/15/logical-replication-publication.html) is a subscription to the WAL.

Creation is made with [a script](/packages/00-database/src/_scripts/_publication.ts) in [00-database](/packages/00-database) package.

The publication here is setup to watch **every changes** in **`operational`** schema.
See [00-database](/packages/00-database) documentation to learn more about schemas.

#### 3. Configuring the tables

Tables should have their [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)
configured to `FULL`. This is required to grab full rows when doing `UPDATE`s (old value and new value).
This has to be made, **for each operational table**, in [SQL migrations](/packages/00-database/src/prisma/migrations).
