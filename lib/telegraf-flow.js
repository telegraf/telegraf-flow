const Flow = require('./flows/default')
const QuizFlow = require('./flows/quiz')
const FlowContext = require('./context')

class TelegrafFlow {
  constructor (flows, options) {
    this.flows = new Map()
    Object.keys(flows || {}).forEach((key) => {
      this.flows.set(key, flows[key])
    })
  }

  register (flow) {
    if (!flow || !flow.middleware || !flow.id) {
      throw new Error('Invalid flow')
    }
    this.flows.set(flow.id, flow)
    return this
  }

  setDefault (flow) {
    this.register(flow)
    this.default = flow.id
    return this
  }

  middleware () {
    return (ctx, next) => {
      if (!ctx.session) {
        throw new Error("Can't find session.")
      }
      ctx.flow = new FlowContext(ctx, this.flows)
      const flow = ctx.flow.current
      if (!flow && this.default) {
        return ctx.flow.start(this.default, {}, true).then(() => ctx.flow.current.middleware()(ctx, next))
      }
      return flow ? flow.middleware()(ctx, next) : next()
    }
  }
}

TelegrafFlow.Flow = Flow
TelegrafFlow.QuizFlow = QuizFlow
module.exports = TelegrafFlow
