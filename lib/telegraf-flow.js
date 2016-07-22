const Flow = require('./flow')
const FlowContext = require('./context')

class TelegrafFlow {

  constructor (flows, options) {
    this.options = Object.assign({
      cancelCommands: ['/cancel']
    }, options)
    this.flows = flows || {}
  }

  register (flow) {
    if (!flow || !flow.id) {
      throw new Error('Invalid Flow')
    }
    this.flows[flow.id] = flow
    return this
  }

  setDefault (flow) {
    this.defaultFlow = flow
    return this
  }

  middleware () {
    return (ctx, next) => {
      if (!ctx.session) {
        throw new Error("Can't find session")
      }
      ctx.flow = new FlowContext(ctx, this.flows)
      const session = ctx.session.__flow || {}
      if (ctx.message && ctx.message.text && this.options.cancelCommands.indexOf(ctx.message.text) !== -1) {
        ctx.flow.stop()
      }
      var currentFlow = this.defaultFlow
      if (session.flowId && this.flows[session.flowId]) {
        ctx.state.flow = Object.assign({}, session.state)
        currentFlow = this.flows[session.flowId]
      }
      if (!currentFlow) {
        return next()
      }
      return currentFlow.middleware()(ctx).finally(() => {
        if (ctx.session.__flow) {
          ctx.session.__flow.state = ctx.state.flow
        }
      })
    }
  }
}

TelegrafFlow.Flow = Flow

module.exports = TelegrafFlow
