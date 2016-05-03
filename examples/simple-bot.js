var debug = require('debug')('telegraf:flow-example')
var Telegraf = require('telegraf')
var Flow = require('../lib/flow')

// See https://github.com/telegraf/kwiz for details
var sampleFlow = {
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

// Specify cancel flow command, default value: `/cancel`
flow.cancelCommand = '/stop'

// Register flow
flow.registerFlow('beveragePoll', sampleFlow)

// Add flow message handler
flow.onMessage('beveragePoll', function * () {
  debug('Before', this.state)
})

// Add flow progress handler
flow.onReply('beveragePoll', function * () {
  debug('After', this.state)
})

// Add flow completion handler
flow.onComplete('beveragePoll', function * () {
  var results = JSON.stringify(this.state.flow, null, 2)
  var status = this.state.flow.canceled ? 'canceled' : 'completed'
  this.reply(`Flow ${status} ${results}`)
})

// start flow on command
app.hears('/flow', function * () {
  yield this.startFlow('beveragePoll')
})

app.startPolling(100)
