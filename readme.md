# Telegraf flow engine

[![Build Status](https://img.shields.io/travis/telegraf/telegraf-flow.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-flow)
[![NPM Version](https://img.shields.io/npm/v/telegraf-flow.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-flow)

Flow engine for [Telegraf (Telegram bot framework)](https://github.com/telegraf/telegraf).

## Installation

```js
$ npm install telegraf-flow
```

## Flow Example
  
```js
var Telegraf = require('telegraf')
var TelegrafFlow = require('telegraf-flow')

var app = new Telegraf(process.env.BOT_TOKEN)
var flow = new TelegrafFlow()

app.use(Telegraf.memorySession())

// Add flow middleware
app.use(flow.middleware())

// Register flow
flow.registerFlow('deadbeef',
  // flow start handler
  function * () {
    yield this.reply(this.state.flow.message || 'Hi')
  },
  // flow handler
  function * () {
    if (this.message && this.message.text && this.message.text.toLowerCase() === 'hi') {
      yield this.reply('Buy')
      yield this.flow.stop()
      return
    }
    yield this.flow.start('deadbeef', {message: 'Really?'})
  }
)

// start flow on command
app.hears('/flow', function * () {
  yield this.flow.start('deadbeef')
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
| startHandlers | `GeneratorFunction[]` | Flow start handler |
| handlers | `GeneratorFunction[]` | Flow handler |
| endHandlers | `GeneratorFunction[]` | Flow end handler |

* * *

<a name="onflowstart"></a>
#### `flow.onFlowStart(flowId, handler, [handler...])`

Registers on start handler for provided flow.

| Param | Type | Description |
| --- | --- | --- |
| flowId | `string` | Flow id |
| handler | `GeneratorFunction` | Handler |

* * *

<a name="onflow"></a>
#### `flow.onFlow(flowId, handler, [handler...])`

Registers flow handler.

| Param | Type | Description |
| --- | --- | --- |
| flowId | `string` | Flow id |
| handler | `GeneratorFunction` | Handler |

* * *

<a name="onflowend"></a>
#### `flow.onFlowEnd(flowId, handler, [handler...])`

Registers on end handler for provided flow.

| Param | Type | Description |
| --- | --- | --- |
| flowId | `string` | Flow id |
| handler | `GeneratorFunction` | Handler |

* * *

## User context

Telegraf user context props and functions:

```js
recast.onXXX(function * (){
  this.flow.start(id, [state, silent])  // Start flow 
  this.flow.stop([silent])              // Stop current flow  
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

