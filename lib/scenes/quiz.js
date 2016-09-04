// Kwiz library documentation https://github.com/telegraf/kwiz
const Kwiz = require('kwiz')
const noop = () => undefined

class QuizScene {
  constructor (id, quizData, options) {
    this.id = id
    this.quizData = quizData
    this.options = Object.assign({
      cancelCommands: ['/cancel', '/stop'],
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
      const quiz = new Kwiz(this.quizData, ctx.flow.state, this.options.answerHandlers)
      let userMessage = ctx.message
      if (ctx.message && ctx.message.text) {
        userMessage = ctx.message.text
      }
      if (ctx.callbackQuery) {
        ctx.answerCallbackQuery().catch(noop)
        userMessage = ctx.callbackQuery.data
      }
      return quiz.processMessage(userMessage).then((reply) => {
        ctx.flow.state = quiz.getState()
        const tasks = []
        if (reply.message) {
          tasks.push(ctx.reply(reply.message, Object.assign({}, reply.attachment)))
        }
        if (reply.completed) {
          tasks.push(ctx.flow.complete({
            answers: ctx.flow.state.answers
          }))
        }
        return Promise.all(tasks)
      })
    }
  }

  startHandler () {
    return (ctx, next) => {
      const quiz = new Kwiz(this.quizData, ctx.flow.state, this.options.answerHandlers)
      return quiz.start(ctx.flow.state.message)
        .then((reply) => {
          ctx.flow.state = quiz.getState()
          return ctx.reply(reply.message, reply.attachment).then(next)
        })
    }
  }
}

module.exports = QuizScene
