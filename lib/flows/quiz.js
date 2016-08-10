const { passThru } = require('telegraf')
const Kwiz = require('kwiz')

class QuizFlow {
  constructor (id, quizDefinition, options) {
    this.id = id
    this.quizDefinition = quizDefinition
    this.options = Object.assign({
      cancelCommands: ['/cancel'],
      answerHandlers: {}
    }, options)
  }

  middleware () {
    return (ctx, next) => {
      if (ctx.message && ctx.message.text && this.options.cancelCommands.indexOf(ctx.message.text) !== -1) {
        return ctx.flow.complete({
          answers: ctx.flow.state.answers,
          canceled: true
        })
      }
      const quiz = new Kwiz(this.quizDefinition, ctx.flow.state, this.options.answerHandlers)
      var userMessage = ctx.message
      if (ctx.message && ctx.message.text) {
        userMessage = ctx.message.text
      }
      if (ctx.callbackQuery) {
        ctx.answerCallbackQuery()
        userMessage = ctx.callbackQuery.data
      }
      return quiz.processMessage(userMessage).then((quizReply) => {
        ctx.flow.state = quiz.getState()
        const tasks = []
        if (quizReply.message) {
          tasks.push(ctx.reply(quizReply.message, Object.assign({}, quizReply.attachment)))
        }
        if (quizReply.completed) {
          tasks.push(ctx.flow.complete({
            answers: ctx.flow.state.answers
          }))
        }
        return Promise.all(tasks)
      })
    }
  }

  startMiddleware () {
    return (ctx, next) => {
      const quiz = new Kwiz(this.quizDefinition, ctx.flow.state, this.options.answerHandlers)
      return quiz.start(ctx.flow.state.message)
        .then((reply) => {
          ctx.flow.state = quiz.getState()
          return ctx.reply(reply.message, reply.attachment).then(next)
        })
    }
  }

  resultMiddleware () {
    return passThru()
  }
}

module.exports = QuizFlow
