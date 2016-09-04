const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { Scene, WizardScene } = TelegrafFlow

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

const superWizard = new WizardScene('super-wizard',
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

flowEngine.register(superWizard)

const defaultScene = new Scene('default')
defaultScene.command('wizard', (ctx) => ctx.flow.start('super-wizard'))
defaultScene.onResultFrom('super-wizard', (ctx) => ctx.reply('Wizard result: ' + JSON.stringify(ctx.flow.result, null, 2)))
flowEngine.setDefault(defaultScene)

app.use(Telegraf.memorySession())
app.use(flowEngine.middleware())

app.startPolling()
