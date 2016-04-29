var Telegraf = require('telegraf')
var session = require('telegraf-session-rethinkdb')
var Flow = require('../lib/flow')

var sampleFlow = {
  name: 'beverage poll',
  questions: [
    {
      message: 'What is your name?',
      answer: { type: 'string', id: 'name'}
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
          one_time_keyboard: true
        }
      }
    },
    {
      message: 'Buy {{answers.name}}'
    }
  ]
}

var app = new Telegraf(process.env.BOT_TOKEN)
var flow = new Flow()

// Register flow and completion handler
flow.register(sampleFlow, function * () {
  this.reply(`Flow completed with results:\n${JSON.stringify(this.state.flow.answers)}`)
})

app.use(session())
app.use(flow.middleware())

// start flow on command
app.hears('/flow', function * () {
  yield this.startFlow(sampleFlow.name)
})

app.startPolling(10)
