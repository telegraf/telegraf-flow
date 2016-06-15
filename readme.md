[![Build Status](https://img.shields.io/travis/telegraf/telegraf-flow.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-flow)
[![NPM Version](https://img.shields.io/npm/v/telegraf-flow.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-flow)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

# Telegraf flow engine

Flow engine for [Telegraf (Telegram bot framework)](https://github.com/telegraf/telegraf).

## Installation

```js
$ npm install telegraf-flow
```

## Flow Example
  
```js
const Telegraf = require('telegraf')
const TelegrafFlow = require('telegraf-flow')

const app = new Telegraf(process.env.BOT_TOKEN)
const flow = new TelegrafFlow()

app.use(Telegraf.memorySession())

// Add flow middleware
app.use(flow.middleware())

// Register flow
flow.registerFlow('deadbeef',
  (ctx) => ctx.reply(ctx.state.flow.message || 'Hi'), // flow start handler
  (ctx) => {
    if (ctx.message && ctx.message.text && ctx.message.text.toLowerCase() === 'hi') { 
      // flow handler
      ctx.reply('Buy')
      return ctx.flow.stop()
    }
    return ctx.flow.start('deadbeef', {message: 'Really?'})
  }
)

// start flow on command
app.hears('/flow', (ctx) => {
  return ctx.flow.start('deadbeef')
})

app.startPolling()
```

## API

- [`new TelegrafFlow()`](#new)
  - [`.registerFlow(flowId, [startHandlers, handlers, endHandlers])`](#registerflow)
  - [`.onFlowStart(flowId, handler[], [handler...])`](#onflowstart)
  - [`.onFlow(flowId, handler[], [handler...])`](#onflowstart)
  - [`.onFlowEnd(flowId, handler[], [handler...])`](#onflowstart)

* * *

<a name="new"></a>
#### `new TelegrafFlow()`

Initialize new TelegrafFlow.

* * *

<a name="registerflow"></a>
#### `flow.registerFlow(flowId, [startHandlers, handlers, endHandlers])`

Registers flow handler.

| Param | Type | Description |
| --- | --- | --- |
| flowId | `string` | Flow id |
| startHandlers | `function[]` | Flow start handler |
| handlers | `function[]` | Flow handler |
| endHandlers | `function[]` | Flow end handler |

* * *

<a name="onflowstart"></a>
#### `flow.onFlowStart(flowId, handler, [handler...])`

Registers on start handler for provided flow.

| Param | Type | Description |
| --- | --- | --- |
| flowId | `string` | Flow id |
| handler | `function` | Handler |

* * *

<a name="onflow"></a>
#### `flow.onFlow(flowId, handler, [handler...])`

Registers flow handler.

| Param | Type | Description |
| --- | --- | --- |
| flowId | `string` | Flow id |
| handler | `function` | Handler |

* * *

<a name="onflowend"></a>
#### `flow.onFlowEnd(flowId, handler, [handler...])`

Registers on end handler for provided flow.

| Param | Type | Description |
| --- | --- | --- |
| flowId | `string` | Flow id |
| handler | `function` | Handler |

* * *

## User context

Telegraf user context props and functions:

```js
app.on((ctx) => {
  ctx.flow.start(id, [state, silent]) => Promise  // Start flow 
  ctx.flow.stop([silent]) => Promise             // Stop current flow  
});
```

## License

The MIT License (MIT)

Copyright (c) 2016 Vitaly Domnikov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

