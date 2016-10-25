const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { Scene, enter } = TelegrafFlow

const flow = new TelegrafFlow()

// Global commands
flow.command('help', (ctx) => ctx.reply('Help message'))
flow.command('greeter', enter('greeter'))
flow.command('echo', enter('echo'))

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
