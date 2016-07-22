const Telegraf = require('telegraf')
const TelegrafFlow = require('../lib/telegraf-flow')
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

telegraf.startPolling(30)
