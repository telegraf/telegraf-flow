const debug = require('debug')('telegraf:flow')
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
      if (ctx.message && ctx.message.text && this.options.cancelCommands.indexOf(ctx.message.text) !== -1) {
        ctx.flow.stop()
      }

      const session = ctx.session.__flow
      var currentFlow = this.defaultFlow

      if (session && session.flowId && this.flows[session.flowId]) {
        debug('flow session state', session)
        ctx.state.flow = session.state || {}
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
