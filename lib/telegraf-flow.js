const debug = require('debug')('telegraf:flow')
const compose = require('telegraf').compose
const Flow = require('./flow')
const FlowContext = require('./context')

class TelegrafFlow {

  constructor (opts) {
    const options = Object.assign({
      flows: {},
      cancelCommands: ['/cancel']
    }, opts)
    this.cancelCommands = options.cancelCommands
    this.flows = options.flows
  }

  register (flow) {
    if (!flow.id) {
      throw new Error('Flow id is empty')
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
      if (ctx.message && ctx.message.text && this.cancelCommands.indexOf(ctx.message.text) !== -1) {
        ctx.flow.stop()
      }

      const sessionState = ctx.session.__flow
      var currentFlow = this.defaultFlow

      if (sessionState && sessionState.flowId && this.flows[sessionState.flowId] && this.flows[sessionState.flowId].middlewares.length > 0) {
        debug('flow session state', sessionState)
        ctx.state.flow = sessionState.state || {}
        currentFlow = this.flows[sessionState.flowId]
      }

      if (!currentFlow) {
        return next()
      }

      return compose(currentFlow.middlewares)(ctx).finally(() => {
        if (ctx.session.__flow) {
          ctx.session.__flow.state = ctx.state.flow
        }
      })
    }
  }
}

TelegrafFlow.Flow = Flow

module.exports = TelegrafFlow
