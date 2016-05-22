var Telegraf = require('telegraf')
var Flow = require('../lib/flow')

// See https://github.com/telegraf/kwiz for details
var sampleQuiz = {
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

var telegraf = new Telegraf(process.env.BOT_TOKEN)
var flow = new Flow()

// For testing only. Session will be lost on app restart
telegraf.use(Telegraf.memorySession())

// Add middleware
telegraf.use(flow.middleware())

// Register flow
flow.registerFlow('deadbeef',
  function * () {
    yield this.reply(this.state.flow.message || 'Hi')
  },
  function * () {
    if (this.message && this.message.text && this.message.text.toLowerCase() === 'hi') {
      yield this.reply('Buy')
      return this.stopFlow()
    }
    yield this.startFlow('deadbeef', {message: 'Really?'})
  }
)

// start flow on command
telegraf.hears('/flow', function * () {
  yield this.startFlow('deadbeef')
})

// Register quiz
flow.registerQuiz('beveragePoll', sampleQuiz, function * () {
  var results = JSON.stringify(this.state.quiz, null, 2)
  var status = this.state.quiz.canceled ? 'canceled' : 'completed'
  yield this.reply(`Quiz ${status} ${results}`)
})

// Specify cancel quiz commands, default value: [`/cancel`]
flow.cancelCommands = ['/cancel', '/stop', 'please stop']

// start quiz on command
telegraf.hears('/quiz', function * () {
  yield this.startQuiz('beveragePoll')
})

telegraf.startPolling()
