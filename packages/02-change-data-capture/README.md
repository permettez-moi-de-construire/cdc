[← theia](/README.md)

# packages / 02-change-data-capture

This block is the **CDC** (Change Data Capture) part of Theia. It's responsible of watching operational database changes and dispatching them through webhooks.

It's meant to be plugged *via* webhooks to a data change handler (most likely [Make.com](https://www.make.com/) or similar) to reason and react to actual business objects changes.

In the future (probably with authentication plugged on it), it will also be responsible of dispatching data change webhooks to actual end API users.

## Launch

*Hatch* and *Dispatcher* are 2 separate long-running scripts meant to be run on their own (in no particular order), which are talking to each other through AMQP.

See [workspace scripts](/README.md#workspace-scripts) for general run instructions, or digg inside each package internal scripts for details.

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

### Communication

Changes are published by **Hatch** to **Dispatcher** via AMQP exchanges and queues.
The binding can be expressed as follow :

- A single **Exchange** of type [topic](https://www.cloudamqp.com/blog/rabbitmq-topic-exchange-explained.html) is used,
its name is defined through an environment variable.
- For each webhook subscription, a **Queue** is created and bound to the exchange for the selected topic

This setup allows per-subscription events lifecycle. In other words, each webhook subscription is managed independantly — be it on success, retries, failures, delays, etc.

#### Topic selection

Topic selection is made in the webhook subscription body itself, and reflected in the binding routing key :

Webhook subscription body
```JSON
{
  "name": "my-new-webhook",
  "url": "http://some-url/webhook-receiver",
  "object": "bears",
  "action": "insert"
}
```

The generated routing key is in the form of `[main-routing-key].[schema].[table].[operation]`. In our example, it would be
```
[process.env.AMQP_ROUTING_KEY].operational.bears.insert
```

This mecanism allows extreme performance and granularity on topic selection for webhook subscribers. In our example, the subscriber would only receive `INSERT`s events on the table `bears`.
