var debug = require('debug')('telegraf:flow-example')
var Telegraf = require('telegraf')
var Flow = require('../lib/flow')

// See https://github.com/telegraf/kwiz for details
var sampleQuiz = {
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

var app = new Telegraf(process.env.BOT_TOKEN)
var flow = new Flow()

// For testing only. Session will be lost on app restart
app.use(Flow.memorySession())

// Add flow middleware
app.use(flow.middleware())

// Specify cancel quiz commands, default value: [`/cancel`]
flow.cancelCommands = ['/stop', 'please stop']

// Register quiz
flow.registerQuiz('beveragePoll', sampleQuiz)

// Add quiz completion handler
flow.onQuizCompleted('beveragePoll', function * () {
  var results = JSON.stringify(this.state.quiz, null, 2)
  var status = this.state.quiz.canceled ? 'canceled' : 'completed'
  yield this.reply(`Quiz ${status} ${results}`)
})

// Flows, flows everywhere
flow.onFlowStart('deadbeef', function * () {
  yield this.reply(this.state.flow.message || 'Hi')
})

flow.onFlow('deadbeef', function * () {
  if (this.message && this.message.text && this.message.text.toLowerCase() == 'hi') {
    yield this.reply('Buy')
    return this.stopFlow()
  }
  yield this.startFlow('deadbeef', {message: 'Really?'})
})

// start quiz on command
app.hears('/quiz', function * () {
  yield this.startQuiz('beveragePoll')
})

// start flow on command
app.hears('/flow', function * () {
  yield this.startFlow('deadbeef')
})

app.startPolling(100)
