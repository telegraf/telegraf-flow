var debug = require('debug')('telegraf:flow')
var mdEscape = require('markdown-escape')
var htmlEscape = require('escape-html')
var compose = require('koa-compose')
var Kwiz = require('kwiz')

var flow = TelegrafFlow.prototype
module.exports = TelegrafFlow

TelegrafFlow.Handlebars = Kwiz.Handlebars

TelegrafFlow.Handlebars.registerHelper('markdown', mdEscape)
TelegrafFlow.Handlebars.registerHelper('html', htmlEscape)

function TelegrafFlow (opts) {
  opts = Object.assign({
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
    handlers: []
  }
}

flow.onFlowStart = function (id) {
  if (!id) {
    throw new Error('Flow id is empty')
  }
  var fns = [].slice.call(arguments, 1)
  this.flows[id] = this.flows[id] || { handlers: [], startHandlers: [] }
  this.flows[id].startHandlers = this.flows[id].startHandlers.concat(fns)
}

flow.onFlow = function (id) {
  if (!id) {
    throw new Error('Flow id is empty')
  }
  var fns = [].slice.call(arguments, 1)
  this.flows[id] = this.flows[id] || { handlers: [], startHandlers: [] }
  this.flows[id].handlers = this.flows[id].handlers.concat(fns)
}

flow.onQuizCompleted = function (id) {
  if (!id || !this.quizes[id]) {
    throw new Error("Can't find quiz with id: " + id)
  }
  var fns = [].slice.call(arguments, 1)
  this.quizes[id].handlers = this.quizes[id].handlers.concat(fns)
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

    this.startFlow = function * (id, state, silent) {
      debug('startFlow', id)
      if (!id) {
        throw new Error('Flow id is empty')
      }
      context.session.__flow = {
        flowId: id,
        state: state
      }
      context.state.flow = Object.assign({}, state)
      if (!silent && allFlows[id] && allFlows[id].startHandlers) {
        yield compose(allFlows[id].startHandlers)
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
        .then((reply) => {
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
      this.state.quiz = quizSession.state

      if (this.message && this.message.text && self.cancelCommands.indexOf(this.message.text) !== -1) {
        this.state.quiz.canceled = true
        delete this.session.__quiz
        yield compose(currentQuiz.handlers)
        return
      }

      var currentQuiz = allQuizes[quizSession.quizId]
      var quiz = new Kwiz(currentQuiz.quiz, quizSession.state, self.answerHandlers)

      var userAnswer = this.message
      if (this.message && this.message.text) {
        userAnswer = this.message.text
      }
      if (this.callbackQuery) {
        userAnswer = this.callbackQuery.data
        yield this.answerCallbackQuery()
      }

      var userReply = yield quiz.processMessage(userAnswer)
      this.session.__quiz.state = quiz.getState()
      this.state.quiz = quiz.getState()
      if (userReply.completed) {
        delete this.session.__quiz
        yield compose(currentQuiz.handlers)
      }
      if (userReply.message) {
        yield this.reply(userReply.message, Object.assign({}, userReply.attachment))
      }
    } else if (flowSession && flowSession.flowId && allFlows[flowSession.flowId] && allFlows[flowSession.flowId].handlers.length > 0) {
      var currentFlow = allFlows[flowSession.flowId]
      this.state.flow = Object.assign({}, flowSession.state)
      yield compose(currentFlow.handlers)
      if (this.session.__flow) {
        this.session.__flow.state = this.state.flow
      }
    } else {
      yield next
    }
  }
}
