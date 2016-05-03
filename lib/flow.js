var debug = require('debug')('telegraf:flow')
var mdEscape = require('markdown-escape')
var htmlEscape = require('escape-html')
var compose = require('koa-compose')
var Kwiz = require('kwiz')
var memorySession = require('./memory-session')

var flow = TelegrafFlow.prototype
module.exports = TelegrafFlow

TelegrafFlow.memorySession = memorySession
TelegrafFlow.Handlebars = Kwiz.Handlebars

TelegrafFlow.Handlebars.registerHelper('markdown', mdEscape)
TelegrafFlow.Handlebars.registerHelper('html', htmlEscape)

function TelegrafFlow (opts) {
  var opts = Object.assign({
    cancelCommand: '/cancel',
    flows: {}
  }, opts)
  this.cancelCommand = opts.cancelCommand
  this.flows = opts.flows
  this.answerHandlers = opts.answerHandlers
}

flow.registerFlow = function (id, flow) {
  if (!id) {
    throw new Error('Flow id is empty')
  }
  this.flows[id] = {
    flow: flow,
    middleware: [],
    messageMiddleware: [],
    replyMiddleware: []
  }
}

flow.onComplete = function (id) {
  if (!id || !this.flows[id]) {
    throw new Error("Can't find flow with id: " + id)
  }
  var fns = [].slice.call(arguments, 1)
  this.flows[id].middleware = this.flows[id].middleware.concat(fns)
}

flow.onMessage = function (id) {
  if (!id || !this.flows[id]) {
    throw new Error("Can't find flow with id: " + id)
  }
  var fns = [].slice.call(arguments, 1)
  this.flows[id].messageMiddleware = this.flows[id].messageMiddleware.concat(fns)
}

flow.onReply = function (id) {
  if (!id || !this.flows[id]) {
    throw new Error("Can't find flow with id: " + id)
  }
  var fns = [].slice.call(arguments, 1)
  this.flows[id].replyMiddleware = this.flows[id].replyMiddleware.concat(fns)
}

flow.registerAnswerHandler = function (type, handler) {
  this.answerHandlers[type] = handler
}

flow.middleware = function () {
  var self = this
  var allFlows = this.flows

  return function * (next) {
    var context = this

    if (!this.session) {
      throw new Error("Can't find session")
    }

    this.startFlow = function (id, message, state) {
      debug('startFlow', id)
      if (!id || !allFlows[id]) {
        return Promise.reject("Can't find flow with id: " + id)
      }
      var flow = new Kwiz(allFlows[id].flow, state, self.answerHandlers)
      return flow.start(message)
        .then(function (reply) {
          context.session.__flow = {
            id: id,
            state: flow.getState()
          }
          return context.reply(reply.message, Object.assign({}, reply.attachment))
        })
    }

    var flowSession = Object.assign({}, this.session.__flow)
    if (!flowSession.id || !allFlows[flowSession.id] || !flowSession.state || flowSession.state.completed) {
      return yield next
    }
    var currentFlow = allFlows[flowSession.id]
    yield compose(currentFlow.messageMiddleware)

    this.state.flow = flowSession.state
    if (this.message && this.message.text === self.cancelCommand) {
      this.state.flow.canceled = true
      delete this.state.flow.cursor
      delete this.session.__flow
      yield compose(currentFlow.middleware)
      yield compose(currentFlow.replyMiddleware)
      return
    }
    var flow = new Kwiz(currentFlow.flow, flowSession.state, self.answerHandlers)
    var message = this.message
    if (this.message && this.message.text) {
      message = this.message.text
    }
    if (this.callbackQuery) {
      message = this.callbackQuery.data
    }

    var reply = yield flow.processMessage(message)
    this.session.__flow.state = flow.getState()
    this.state.flow = flow.getState()

    if (reply.completed) {
      delete this.state.flow.cursor
      delete this.session.__flow
      yield compose(currentFlow.middleware)
    }
    if (reply.message) {
      yield this.reply(reply.message, Object.assign({}, reply.attachment))
    }
    yield compose(currentFlow.replyMiddleware)
  }
}
