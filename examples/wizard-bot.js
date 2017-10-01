const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { WizardScene, enter } = TelegrafFlow

const superWizard = new WizardScene('super-wizard',
  (ctx) => {
    ctx.reply('Step 1')
    ctx.flow.wizard.next()
  },
  (ctx) => {
    if (ctx.message && ctx.message.text !== 'ok') {
      return ctx.replyWithMarkdown('Send `ok`')
    }
    ctx.reply('Step 2 ')
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

const flow = new TelegrafFlow([superWizard], {defaultScene: 'super-wizard'})
const app = new Telegraf(process.env.BOT_TOKEN)
app.use(Telegraf.memorySession())
app.use(flow.middleware())
app.startPolling()
