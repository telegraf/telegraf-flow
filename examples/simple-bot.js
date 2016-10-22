const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { Scene } = TelegrafFlow

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

app.use(Telegraf.memorySession())
app.use(flowEngine.middleware())

// Default scene
const defaultScene = new Scene('default')
defaultScene.command('greeter', (ctx) => ctx.flow.enter('greeter'))
defaultScene.command('echo', (ctx) => ctx.flow.enter('echo'))

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
flowEngine.setDefault(defaultScene)
flowEngine.register(greeterScene)
flowEngine.register(echoScene)

app.startPolling()
