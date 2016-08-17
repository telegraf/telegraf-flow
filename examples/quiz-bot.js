const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
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

const app = new Telegraf(process.env.BOT_TOKEN)
const flowEngine = new TelegrafFlow()

app.use(Telegraf.memorySession())
app.use(flowEngine.middleware())

const sampleFlow = new Flow('default-flow')
sampleFlow.command('/quiz', (ctx) => ctx.flow.start('beverage'))
sampleFlow.onResultFrom('beverage', (ctx) => ctx.reply('Beverage result: ' + JSON.stringify(ctx.flow.result, null, 2)))
flowEngine.setDefault(sampleFlow)

flowEngine.register(new QuizFlow('beverage', beverageQuizDefinition))

app.startPolling(30)
