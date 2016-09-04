const FlowContext = require('./context')

class TelegrafFlow {
  constructor (flows, options) {
    this.options = Object.assign({sessionName: 'session'}, options)
    this.flows = new Map()
    if (flows) {
      flows.forEach((flow) => {
        this.register(flow)
      })
    }
  }

  register (flow) {
    if (!flow || !flow.id || !flow.middleware || !flow.startMiddleware || !flow.resultMiddleware) {
      throw new Error('Invalid flow')
    }
    this.flows.set(flow.id, flow)
    return this
  }

  setDefault (flow) {
    this.register(flow)
    this.defaultFlowId = flow.id
    return this
  }

  middleware () {
    return (ctx, next) => {
      if (!ctx[this.options.sessionName]) {
        throw new Error("Can't find session.")
      }
      ctx.flow = new FlowContext(ctx, this.flows, this.options)
      const flow = ctx.flow.current
      if (!flow && this.defaultFlowId) {
        return ctx.flow.start(this.defaultFlowId, null, true).then(() => {
          return ctx.flow.current.middleware()(ctx, next)
        })
      }
      return flow ? flow.middleware()(ctx, next) : next()
    }
  }

  static ensureState (field, failFn) {
    return (ctx, next) => {
      const failHandler = failFn || ctx.flow.back
      return ctx.flow && ctx.flow.state && ctx.flow.state[field] ? next() : failHandler()
    }
  }
}

module.exports = TelegrafFlow
