[← theia](/README.md)

# packages / 02-change-data-capture

This block is the **CDC** (Change Data Capture) part of Theia. It's responsible of watching operational database changes and dispatching them through webhooks.

It's meant to be plugged *via* webhooks to a data change handler (most likely [Make.com](https://www.make.com/) or similar) to reason and react to actual business objects changes.

In the future (probably with authentication plugged on it), it will also be responsible of dispatching data change webhooks to actual end API users.

## Architecture

![theia-cdc](https://user-images.githubusercontent.com/10728426/212089625-0e4cb170-aa1e-4232-aeb8-58561cde754f.png)

It compound of 2 separate components
- [01-hatch](01-hatch) :
  - watching operational database changes
  - parsing / filtering / formating them
  - and wrapping them in AMQP events
- [02-dispatcher](02-webhooks) :
  - exposing a simple webhooks API (subscribe / unsubscribe)
  - and consuming AMQP events of the hatch and posting them to webhooks subscribers

## Launch and relation

*Hatch* and *Dispatcher* are 2 separate long-running scripts meant to be run on their own (in no particular order), which are talking to each other through AMQP.

See [workspace scripts](/README.md#workspace-scripts) for general run instructions, or digg inside each package internal scripts for details.
