var debug = require('debug')('telegraf:flow')
var Kwiz = require('kwiz')

var flow = Flow.prototype
module.exports = Flow

function Flow () {
  this.flows = {}
  this.answerHandlers = {}
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

  return function * (next) {
    var context = this

    if (!this.session) {
      throw new Error("Can't find session")
    }

    this.startFlow = function (name) {
       debug('startFlow', name)
      if (!self.flows[name]) {
        return Promise.reject("Can't find flow")
      }
      var flow = new Kwiz(self.flows[name].flow, null, self.answerHandlers)
      return flow.start()
        .then(function (reply) {
          context.session.__flow = {
            name: name,
            state: flow.getState()
          }
          return context.reply(reply.message, Object.assign({}, reply.attachment))
        })
    }

    var sessionState = Object.assign({}, this.session.__flow)
    if (!sessionState.name || !self.flows[sessionState.name] || !sessionState.state || sessionState.state.completed) {
      return yield next
    }
    var flow = new Kwiz(self.flows[sessionState.name].flow, sessionState.state, self.answerHandlers)
    var message =  this.message
    if (this.message && this.message.text) {
      message = this.message.text
    }
    if (this.callbackQuery) {
      message = this.callbackQuery.data
    }
    var reply = yield flow.processMessage(message)
    this.session.__flow.state = flow.getState()

    if (reply.completed && self.flows[sessionState.name].handler) {
      this.state.flow = this.session.__flow.state
      yield self.flows[sessionState.name].handler
    }

    if (reply.message) {
      yield this.reply(reply.message, Object.assign({}, reply.attachment))
    }
  }
}
