const Telegraf = require('telegraf')
const Flow = require('../lib/flow')

const telegraf = new Telegraf(process.env.BOT_TOKEN)
const flow = new Flow()

// For testing only. Session will be lost on app restart
telegraf.use(Telegraf.memorySession())

// Add middleware
telegraf.use(flow.middleware())

// Default handler
flow.registerDefaultHandlers((ctx) => {
  return ctx.flow.start('deadbeef')
})

// Register flow
flow.registerFlow('deadbeef',
  (ctx) => ctx.reply(ctx.state.flow.message || 'Hi'),
  (ctx) => {
    if (ctx.message && ctx.message.text && ctx.message.text.toLowerCase() === 'hi') {
      ctx.reply('Buy')
      return ctx.flow.stop()
    }
    return ctx.flow.restart({message: 'Really?'})
  },
  (ctx) => ctx.reply('👻')
)

telegraf.startPolling()
