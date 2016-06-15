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
const Flow = TelegrafFlow.Flow

const telegraf = new Telegraf(process.env.BOT_TOKEN)
const telegrafFlow = new TelegrafFlow()

// For testing only. Session will be lost on app restart
telegraf.use(Telegraf.memorySession())

// Register middleware
telegraf.use(telegrafFlow.middleware())

const defaultFlow = new Flow()

defaultFlow.on('message', (ctx) => {
  return ctx.flow.start('deadbeef')
})

// Set default flow
telegrafFlow.setDefault(defaultFlow)

// Example flow
const dummyFlow = new Flow('deadbeef')

dummyFlow.onStart((ctx) => ctx.reply(ctx.state.flow.message || 'Hi'))

dummyFlow.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase() === 'hi') {
    ctx.flow.stop()
    return ctx.reply('Buy')
  }
  return ctx.flow.restart({message: 'Really?'})
})

// Register flow
telegrafFlow.register(dummyFlow)

telegraf.startPolling()
```

## User context

Telegraf user context props and functions:

```js
app.on((ctx) => {
  ctx.state.flow                      // Flow state 
  ctx.flow.start(id, [state, silent]) // Start flow 
  ctx.flow.stop([silent])             // Stop current flow  
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

