const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { Scene } = TelegrafFlow

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

app.use(Telegraf.memorySession())
app.use(flowEngine.middleware())

// Set default scene
const defaultScene = new Scene('default')
defaultScene.command('greet', (ctx) => ctx.flow.start('greeter'))
defaultScene.onResultFrom('greeter', (ctx) => ctx.reply('Greeter result: ' + JSON.stringify(ctx.flow.result, null, 2)))
flowEngine.setDefault(defaultScene)

// Example scene
const greeterScene = new Scene('greeter')
greeterScene.onStart((ctx) => ctx.reply(ctx.state.message || 'Hi'))
greeterScene.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase() === 'hi') {
    ctx.reply('Buy')
    return ctx.flow.complete(42)
  }
  ctx.state.message = 'Hello'
  return ctx.flow.restart()
})

flowEngine.register(greeterScene)

app.startPolling()
