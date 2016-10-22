const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { Scene, WizardScene } = TelegrafFlow

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

app.use(Telegraf.memorySession())
app.on('text', flowEngine.middleware())

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
    ctx.reply('Done')
    ctx.flow.stop()
  }
)

const defaultScene = new Scene('default')
defaultScene.command('wizard', (ctx) => ctx.flow.start('super-wizard'))

flowEngine.setDefault(defaultScene)
flowEngine.register(superWizard)

app.startPolling()
