const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { Flow, WizardFlow } = TelegrafFlow

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

const wizard = new WizardFlow('sample-wizard',
  (ctx) => {
    ctx.reply('Step 1')
    ctx.flow.wizard.next()
  },
  (ctx) => {
    ctx.reply('Step 2')
    ctx.flow.wizard.next()
  },
  (ctx) => {
    ctx.reply('Step 3')
    ctx.flow.wizard.next()
  },
  (ctx) => {
    ctx.reply('Step 4')
    ctx.flow.wizard.next()
  },
  (ctx) => {
    ctx.reply('Step 5')
    ctx.flow.complete('WOW')
  }
)

flowEngine.register(wizard)

const sampleFlow = new Flow('default-flow')
sampleFlow.command('/wizard', (ctx) => ctx.flow.start('sample-wizard'))
sampleFlow.onResultFrom('sample-wizard', (ctx) => ctx.reply('Wizard result: ' + JSON.stringify(ctx.flow.result, null, 2)))
flowEngine.setDefault(sampleFlow)

app.use(Telegraf.memorySession())
app.use(flowEngine.middleware())

app.startPolling(30)
