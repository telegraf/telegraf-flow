# Telegraf dialog engine

[![Build Status](https://img.shields.io/travis/telegraf/telegraf-flow.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-flow)
[![NPM Version](https://img.shields.io/npm/v/telegraf-flow.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-flow)

Dialog engine for [Telegraf](https://github.com/telegraf/telegraf).

Based on [Kwiz library](https://github.com/telegraf/kwiz).

> *IMPORTANT: telegraf-flow require any session middleware*

## Installation

```js
$ npm install telegraf-flow
```

## Example
  
```js
var Telegraf = require('telegraf')
var Flow = require('telegraf-flow')
var session = require('telegraf-session-*')

var sampleFlow = {
  ...
}

var app = new Telegraf(process.env.BOT_TOKEN)
var flow = new Flow()

// Register sample flow with completion handler
flow.register(sampleFlow, function * () {
  this.reply(`Flow completed with results:\n${JSON.stringify(this.state.flow.answers)}`)
})

app.use(session())
app.use(flow.middleware())

app.hear('/flow', function * () {
  yield this.startFlow(sampleFlow.name) 
})

app.startPolling()
```

[Other examples](https://github.com/telegraf/telegraf-flow/tree/master/examples/).

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

