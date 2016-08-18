const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { Flow, WizardFlow } = TelegrafFlow

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

const simpleWizardFlow = new WizardFlow('super-wizard',
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

flowEngine.register(simpleWizardFlow)

const sampleFlow = new Flow('default-flow')
sampleFlow.command('/wizard', (ctx) => ctx.flow.start('super-wizard'))
sampleFlow.onResultFrom('super-wizard', (ctx) => ctx.reply('Wizard result: ' + JSON.stringify(ctx.flow.result, null, 2)))
flowEngine.setDefault(sampleFlow)

app.use(Telegraf.memorySession())
app.use(flowEngine.middleware())

app.startPolling(30)
