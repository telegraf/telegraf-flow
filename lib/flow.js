var debug = require('debug')('telegraf:flow')
var Kwiz = require('kwiz')

var flow = Flow.prototype
module.exports = Flow

function Flow (opts) {
  var opts = Object.assign({
    cancelCommand: '/cancel',
    flows: {},
    answerHandlers: {}
  }, opts)
  this.cancelCommand = opts.cancelCommand
  this.flows = opts.flows
  this.answerHandlers = opts.answerHandlers
}

flow.register = function (flow, handler) {
  this.flows[flow.name] = {
    flow: flow,
    handler: handler
  }
}

flow.addAnswerHandler = function (type, handler) {
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

    this.startFlow = function (name) {
      debug('startFlow', name)
      if (!allFlows[name]) {
        return Promise.reject("Can't find flow")
      }
      var flow = new Kwiz(allFlows[name].flow, null, self.answerHandlers)
      return flow.start()
        .then(function (reply) {
          context.session.__flow = {
            name: name,
            state: flow.getState()
          }
          return context.reply(reply.message, Object.assign({}, reply.attachment))
        })
    }

    var flowSession = Object.assign({}, this.session.__flow)
    if (!flowSession.name || !allFlows[flowSession.name] || !flowSession.state || flowSession.state.completed) {
      return yield next
    }
    var currentFlow = allFlows[flowSession.name]
    if (this.message && this.message.text === self.cancelCommand) {
      this.state.flow = flowSession.state
      this.state.flow.canceled = true
      delete this.state.flow.cursor
      delete this.session.__flow
      yield currentFlow.handler
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
    if (reply.completed && currentFlow.handler) {
      this.state.flow = this.session.__flow.state
      delete this.state.flow.cursor
      yield currentFlow.handler
    }

    if (reply.message) {
      yield this.reply(reply.message, Object.assign({}, reply.attachment))
    }
  }
}
