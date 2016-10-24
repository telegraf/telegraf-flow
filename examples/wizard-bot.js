const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { WizardScene } = TelegrafFlow

const flow = new TelegrafFlow()

flow.command('wizard', (ctx) => ctx.flow.enter('super-wizard'))

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
    ctx.flow.leave()
  }
)

flow.register(superWizard)

const app = new Telegraf(process.env.BOT_TOKEN)
app.use(Telegraf.memorySession())
app.on('text', flow.middleware())
app.startPolling()
