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
    cancelCommands: ['/cancel'],
    flows: {},
    quizes: {},
    answerHandlers: {}
  }, opts)
  this.cancelCommands = opts.cancelCommands
  this.quizes = opts.quizes
  this.flows = opts.flows
}

flow.registerQuiz = function (id, quiz) {
  if (!id) {
    throw new Error('Quiz id is empty')
  }
  this.quizes[id] = {
    quiz: quiz,
    middleware: []
  }
}

flow.onFlowStart = function (id) {
  if (!id) {
    throw new Error('Flow id is empty')
  }
  var fns = [].slice.call(arguments, 1)
  this.flows[id] = this.flows[id] || {middleware: [], startMiddleware: []}
  this.flows[id].startMiddleware = this.flows[id].startMiddleware.concat(fns)
}

flow.onFlow = function (id) {
  if (!id) {
    throw new Error('Flow id is empty')
  }
  var fns = [].slice.call(arguments, 1)
  this.flows[id] = this.flows[id] || {middleware: [], startMiddleware: []}
  this.flows[id].middleware = this.flows[id].middleware.concat(fns)
}

flow.onQuizCompleted = function (id) {
  if (!id || !this.quizes[id]) {
    throw new Error("Can't find quiz with id: " + id)
  }
  var fns = [].slice.call(arguments, 1)
  this.quizes[id].middleware = this.quizes[id].middleware.concat(fns)
}

flow.registerAnswerHandler = function (type, handler) {
  this.answerHandlers[type] = handler
}

flow.middleware = function () {
  var self = this
  var allQuizes = this.quizes
  var allFlows = this.flows

  return function * (next) {
    var context = this

    if (!this.session) {
      throw new Error("Can't find session")
    }

    this.startFlow = function * (id, state) {
      debug('startFlow', id)
      if (!id) {
        throw new Error('Flow id is empty')
      }
      context.session.__flow = {
        flowId: id,
        state: state
      }
      context.state.flow = Object.assign({}, state)
      if (allFlows[id] && allFlows[id].startMiddleware) {
        yield compose(allFlows[id].startMiddleware)
      }
      if (context.session.__flow) {
        context.session.__flow.state = context.state.flow
      }
    }

    this.stopFlow = function () {
      delete context.session.__flow
      context.state.flow = {}
    }

    this.startQuiz = function (id, state, message) {
      debug('startQuiz', id)
      if (!id || !allQuizes[id]) {
        return Promise.reject("Can't find quiz with id: " + id)
      }
      var quiz = new Kwiz(allQuizes[id].quiz, state, self.answerHandlers)
      return quiz.start(message)
        .then(function (reply) {
          context.session.__quiz = {
            quizId: id,
            state: quiz.getState()
          }
          return context.reply(reply.message, Object.assign({}, reply.attachment))
        })
    }

    var quizSession = this.session.__quiz
    var flowSession = this.session.__flow
    if (quizSession && quizSession.quizId && allQuizes[quizSession.quizId] && quizSession.state) {
      var currentQuiz = allQuizes[quizSession.quizId]
      this.state.quiz = quizSession.state
      if (this.message && self.cancelCommands.indexOf(this.message.text) !== -1) {
        this.state.quiz.canceled = true
        delete this.session.__quiz
        yield compose(currentQuiz.middleware)
        return
      }

      var quiz = new Kwiz(currentQuiz.quiz, quizSession.state, self.answerHandlers)
      var message = this.message
      if (this.message && this.message.text) {
        message = this.message.text
      }
      if (this.callbackQuery) {
        message = this.callbackQuery.data
        yield this.telegraf.answerCallbackQuery(this.callbackQuery.id)
      }

      var reply = yield quiz.processMessage(message)
      this.session.__quiz.state = quiz.getState()
      this.state.quiz = quiz.getState()
      if (reply.completed) {
        delete this.session.__quiz
        yield compose(currentQuiz.middleware)
      }
      if (reply.message) {
        yield this.reply(reply.message, Object.assign({}, reply.attachment))
      }
    } else if (flowSession && flowSession.flowId && allFlows[flowSession.flowId] && allFlows[flowSession.flowId].middleware.length > 0) {
      var currentFlow = allFlows[flowSession.flowId]
      this.state.flow = Object.assign({}, flowSession.state)
      yield compose(currentFlow.middleware)
      if (this.session.__flow) {
        this.session.__flow.state = this.state.flow
      }
    } else {
      yield next
    }
  }
}
