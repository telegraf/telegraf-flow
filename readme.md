[![Build Status](https://img.shields.io/travis/telegraf/telegraf-flow.svg?branch=master&style=flat-square)](https://travis-ci.org/telegraf/telegraf-flow)
[![NPM Version](https://img.shields.io/npm/v/telegraf-flow.svg?style=flat-square)](https://www.npmjs.com/package/telegraf-flow)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

# Telegraf flow

Fully extensible conversational flow for [Telegram Bots](https://github.com/telegraf/telegraf)

## Installation

```js
$ npm install telegraf-flow
```

## Example
  
```js
const Telegraf = require('telegraf')
const TelegrafFlow = require('telegraf-flow')
const { memorySession} = Telegraf
const { Scene } = TelegrafFlow

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

app.use(memorySession())
app.use(flowEngine.middleware())

const defaultScene = new Scene('math')

defaultScene.onStart((ctx) => ctx.reply(ctx.flow.state.message || '1 + √i=...'))

defaultScene.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase() === '0') {
    ctx.reply('👍')
    return ctx.flow.complete()
  }
  ctx.flow.state.message = '9-3*3=...'
  return ctx.flow.restart()
})

flowEngine.setDefault(defaultScene)

app.startPolling()
```

[Other examples](/examples)

### Telegraf context

Telegraf user context props and functions:

```js
app.on((ctx) => {
  ctx.flow.state                      // Flow state
  ctx.flow.flash                      // Flash message
  ctx.flow.result                     // Result from child scene (see flow.onResult)
  ctx.flow.start(id, [state, silent]) // Start scene
  ctx.flow.complete([result, silent]) // Return some value to parent scene
  ctx.flow.canGoBack()                // Can go back
  ctx.flow.back([silent])             // Go back
  ctx.flow.stop()                     // Stop current scene 
  ctx.flow.clearHistory()             // Clear history
  ctx.flow.reset()                    // Reset engine
});
```

