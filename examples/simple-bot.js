const Telegraf = require('telegraf')
const TelegrafFlow = require('../lib/telegraf-flow')
const { Flow, QuizFlow } = TelegrafFlow

// More info: https://github.com/telegraf/kwiz
const beverageQuizDefinition = {
  questions: [
    {
      message: 'What is your name?',
      answer: { type: 'string', id: 'name' }
    },
    {
      message: 'Got it!\n{{answers.name}}, how old are you?',
      answer: { type: 'int', id: 'age' }
    },
    {
      message: 'Coke or Pepsi?',
      answer: { type: 'choise', items: ['Coke', 'Pepsi'], id: 'beverage' },
      criteria: { 'answers.age': {$lt: 21} },
      attachment: {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Coke', callback_data: 'Coke' },
              { text: 'Pepsi', callback_data: 'Pepsi' }
            ]
          ]
        }
      }
    },
    {
      message: 'Beer or Vine?',
      answer: { type: 'choise', items: ['Beer', 'Vine'], id: 'beverage' },
      criteria: { 'answers.age': {$gte: 21} },
      attachment: {
        reply_markup: {
          keyboard: [['Beer', 'Vine']],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      }
    },
    {
      message: 'Buy {{answers.name}}'
    }
  ]
}

const telegraf = new Telegraf(process.env.BOT_TOKEN)
const telegrafFlow = new TelegrafFlow()

// For testing only. Session will be lost on app restart
telegraf.use(Telegraf.memorySession())

// Register middleware
telegraf.use(telegrafFlow.middleware())

// Set default flow
const defaultFlow = new Flow('default-flow')
defaultFlow.command('/start', (ctx) => ctx.flow.start('deadbeef'))
defaultFlow.command('/quiz', (ctx) => ctx.flow.start('beverage'))
defaultFlow.onResult((ctx) => ctx.reply(JSON.stringify(ctx.flow.result.answers, null, 2)))
telegrafFlow.setDefault(defaultFlow)

// Example flow
const dummyFlow = new Flow('deadbeef')
dummyFlow.onStart((ctx) => ctx.reply(ctx.flow.state.message || 'Hi'))
dummyFlow.onResult((ctx) => ctx.reply(JSON.stringify(ctx.flow.result.answers, null, 2)))
dummyFlow.on('text', (ctx) => {
  if (ctx.message.text.toLowerCase() === 'hi') {
    return ctx.flow.start('beverage')
  }
  return ctx.flow.restart({message: 'Hello'})
})

telegrafFlow.register(dummyFlow)
telegrafFlow.register(new QuizFlow('beverage', beverageQuizDefinition))

telegraf.startPolling(30)
