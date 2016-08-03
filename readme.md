[![Build Status](https://img.shields.io/travis/telegraf/telegraf-flow.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-flow)
[![NPM Version](https://img.shields.io/npm/v/telegraf-flow.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-flow)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

# Telegraf chat flow

[Telegraf](https://github.com/telegraf/telegraf) middleware for creating stateful chatbots  

## Installation

```js
$ npm install telegraf-flow
```

## Flow Example
  
```js
const Telegraf = require('telegraf')
const TelegrafFlow = require('telegraf-flow')
const Flow = TelegrafFlow.Flow

const telegraf = new Telegraf(process.env.BOT_TOKEN)
const telegrafFlow = new TelegrafFlow()

// For testing only. Session will be lost on app restart
telegraf.use(Telegraf.memorySession())

// Register middleware
telegraf.use(telegrafFlow.middleware())

const defaultFlow = new Flow('default-flow')

defaultFlow.command('/help', (ctx) => ctx.reply('Help message'))
defaultFlow.command('/start', (ctx) => ctx.flow.start('deadbeef'))
defaultFlow.onResult((ctx) => ctx.reply(JSON.stringify(ctx.flow.result, null, 2)))
defaultFlow.on('message', (ctx) => ctx.reply('💥'))

// Set default flow
telegrafFlow.setDefault(defaultFlow)

// Example flow
const dummyFlow = new Flow('deadbeef')
dummyFlow.onStart((ctx) => ctx.reply(ctx.state.flow.message || 'Hi'))
dummyFlow.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase() === 'hi') {
    ctx.reply('Buy')
    return ctx.flow.complete({foo: 'bar'})
  }
  return ctx.flow.restart({message: 'Really?'})
})

// Register flow
telegrafFlow.register(dummyFlow)

telegraf.startPolling()
```

## Telegraf context

Telegraf user context props and functions:

```js
app.on((ctx) => {
  ctx.flow.start(id, [state, silent]) // Start flow
  ctx.flow.state                      // Flow state
  ctx.flow.result                     // Result from child flow(see flow.onResult)
  ctx.flow.canGoBack()                // Can go back
  ctx.flow.complete([state, silent])  // Return some value to parent flow
  ctx.flow.back([silent])             // Go back
  ctx.flow.stop()                     // Stop current flow 
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

