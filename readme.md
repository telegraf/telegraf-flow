[![Build Status](https://img.shields.io/travis/telegraf/telegraf-flow.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-flow)
[![NPM Version](https://img.shields.io/npm/v/telegraf-flow.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-flow)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

# Telegraf flow

Fully extensible conversational flow for [Telegram Bots](https://github.com/telegraf/telegraf)

## Installation

```js
$ npm install telegraf-flow
```

## Flow Example
  
```js
const Telegraf = require('telegraf')
const TelegrafFlow = require('telegraf-flow')
const { Flow, memorySession} = TelegrafFlow

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

app.use(memorySession())
app.use(flowEngine.middleware())

const sampleFlow = new Flow('math')
sampleFlow.onStart((ctx) => ctx.reply(ctx.flow.state.message || '1 + √i=...'))
sampleFlow.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase() === '0') {
    ctx.reply('👍')
    return ctx.flow.complete()
  }
  ctx.flow.state.message = '9-3*3=...'
  return ctx.flow.restart()
})

flowEngine.setDefault(sampleFlow)

app.startPolling()
```

[Other examples](/examples)

## API

### Flow 
- [`new Flow(id)`](#new-flow)
 - [`.use(middleware)`](#use)
 - [`.on(updateTypes, middleware, [middleware...])`](#on)
 - [`.hears(triggers, middleware, [middleware...])`](#hears)
 - [`.command(commands, middleware, [middleware...])`](#command)
 - [`.action(triggers, middleware, [middleware...])`](#action)

<a name="new-flow"></a>
#### `new Flow(id)`

Initialize new Flow.

| Param | Type | Description |
| --- | --- | --- |
| id | `string` | Flow id |

* * *

<a name="use"></a>
#### `flow.use(middleware)`

Registers a middleware.

| Param | Type | Description |
| --- | --- | --- |
| middleware | `function` | Middleware function |

* * *

<a name="on"></a>
#### `flow.on(updateTypes, middleware, [middleware...])`

Registers middleware for provided [update type](#update-types).

| Param | Type | Description |
| --- | --- | --- |
| updateTypes | `string`\|`string[]` | [update type](#update-types) |
| middleware | `function` | Middleware |

* * *

<a name="hears"></a>
#### `flow.hears(triggers, middleware, [middleware...])`

Registers middleware for handling `text` messages with regular expressions.

| Param | Type | Description |
| --- | --- | --- |
| triggers | `string[]`\|`RegEx[]` | Triggers |
| middleware | `function` | Middleware |

* * *

<a name="command"></a>
#### `flow.command(commands, middleware, [middleware...])`

Shortcut for [`hears`](#hears)

* * *

<a name="action"></a>
#### `flow.action(triggers, middleware, [middleware...])`

Registers middleware for handling `callback_data` actions with regular expressions.

| Param | Type | Description |
| --- | --- | --- |
| triggers | `string[]`\|`RegEx[]` | Triggers |
| middleware | `function` | Middleware |

### Telegraf context

Telegraf user context props and functions:

```js
app.on((ctx) => {
  ctx.flow.state                      // Flow state
  ctx.flow.flash                      // Flash message
  ctx.flow.result                     // Result from child flow(see flow.onResult)
  ctx.flow.start(id, [state, silent]) // Start flow
  ctx.flow.complete([state, silent])  // Return some value to parent flow(see flow.startForResult)
  ctx.flow.canGoBack()                // Can go back
  ctx.flow.back([silent])             // Go back
  ctx.flow.stop()                     // Stop current flow 
  ctx.flow.clearHistory()             // Clear flow history
  ctx.flow.reset()                    // Reset flow engine
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

