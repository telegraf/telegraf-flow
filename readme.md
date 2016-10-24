[![Build Status](https://img.shields.io/travis/telegraf/telegraf-flow.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-flow)
[![NPM Version](https://img.shields.io/npm/v/telegraf-flow.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-flow)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

# Telegraf flow

> 🚥 Control flow middleware for [Telegraf](https://github.com/telegraf/telegraf)

## Installation

```js
$ npm install telegraf-flow
```

## Example
  
```js
const Telegraf = require('telegraf')
const TelegrafFlow = require('telegraf-flow')
const { Scene } = TelegrafFlow

const flow = new TelegrafFlow()

// Global commands
flow.command('greeter', (ctx) => ctx.flow.enter('greeter'))
flow.command('echo', (ctx) => ctx.flow.enter('echo'))

// Greeter scene
const greeterScene = new Scene('greeter')
greeterScene.enter((ctx) => ctx.reply('Hi'))
greeterScene.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase() === 'hi') {
    ctx.flow.leave()
    return ctx.reply('Buy')
  }
  return ctx.reply('Hi again')
})

// Echo scene
const echoScene = new Scene('echo')
echoScene.enter((ctx) => ctx.reply('echo scene'))
echoScene.command('back', (ctx) => {
  ctx.flow.leave()
  return ctx.reply('Okay')
})
echoScene.on('text', (ctx) => ctx.reply(ctx.message.text))
echoScene.on('message', (ctx) => ctx.reply('Only text messages please'))

// Scene registration
flow.register(greeterScene)
flow.register(echoScene)

const app = new Telegraf(process.env.BOT_TOKEN)
app.use(Telegraf.memorySession())
app.use(flow.middleware())
app.startPolling()
```

[Other examples](/examples)

### Telegraf context

Telegraf user context props and functions:

```js
app.on((ctx) => {
  ctx.flow.state                                    // Current scene state
  
  ctx.flow.enter(sceneId, [defaultState, silent])   // Enter scene
  ctx.flow.leave()                                  // Leave scene 
});
```

