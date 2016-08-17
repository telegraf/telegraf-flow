const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { Flow } = TelegrafFlow

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

app.use(Telegraf.memorySession())
app.use(flowEngine.middleware())

// Set default flow
const sampleFlow = new Flow('default-flow')
sampleFlow.command('/greet', (ctx) => ctx.flow.start('greeter'))
sampleFlow.onResultFrom('greeter', (ctx) => ctx.reply('Greeter result: ' + JSON.stringify(ctx.flow.result, null, 2)))
flowEngine.setDefault(sampleFlow)

// Example flow
const greeterFlow = new Flow('greeter')
greeterFlow.onStart((ctx) => ctx.reply(ctx.flow.state.message || 'Hi'))
greeterFlow.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase() === 'hi') {
    ctx.reply('Buy')
    return ctx.flow.complete()
  }
  ctx.flow.state.message = 'Hello'
  return ctx.flow.restart()
})

flowEngine.register(greeterFlow)

app.startPolling(30)
