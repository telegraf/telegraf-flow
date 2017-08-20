[![Build Status](https://img.shields.io/travis/telegraf/telegraf-flow.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-flow)
[![NPM Version](https://img.shields.io/npm/v/telegraf-flow.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-flow)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

# Telegraf flow

> 🚥 Control flow middleware for [Telegraf](https://github.com/telegraf/telegraf).

## Installation

```js
$ npm install telegraf-flow
```

## Example
  
```js
const Telegraf = require('telegraf')
const TelegrafFlow = require('telegraf-flow')
const { Scene } = TelegrafFlow

// Greeter scene
const greeterScene = new Scene('greeter')
greeterScene.enter((ctx) => ctx.reply('Hi'))
greeterScene.leave((ctx) => ctx.reply('Buy'))
greeterScene.hears(/hi/gi, leave())
greeterScene.on('message', (ctx) => ctx.reply('Send `hi`'))

// Scene registration
const flow = new TelegrafFlow()
flow.register(greeterScene)

const app = new Telegraf(process.env.BOT_TOKEN)
// Flow requires valid Telegraf session
app.use(Telegraf.memorySession())
app.use(flow.middleware())
app.command('greeter', (ctx) => ctx.flow.enter('greeter'))
app.startPolling()
```

[More examples](/examples)

### Telegraf context

Telegraf user context props and functions:

```js
app.on('...', (ctx) => {
  ctx.flow.state                                    // Current scene state
  
  ctx.flow.enter(sceneId, [defaultState, silent])   // Enter scene
  ctx.flow.reenter()                                // Reenter current scene
  ctx.flow.leave()                                  // Leave scene 
});
```

