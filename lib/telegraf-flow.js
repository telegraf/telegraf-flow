const debug = require('debug')('telegraf:flow')
const compose = require('telegraf').compose
const Flow = require('./flow')

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
    const self = this

    return (ctx, next) => {
      if (!ctx.session) {
        throw new Error("Can't find session")
      }

      ctx.flow = {
        start: (id, state, silent) => {
          debug('startFlow', id)
          if (!id) {
            throw new Error('Flow id is empty')
          }
          ctx.session.__flow = {
            flowId: id,
            state: state
          }
          ctx.state.flow = Object.assign({}, state)
          if (silent || !self.flows[id] || !self.flows[id].startHandlers) {
            return Promise.resolve()
          }
          return compose(self.flows[id].startHandlers)(ctx).finally(() => {
            if (ctx.session.__flow) {
              ctx.session.__flow.state = ctx.state.flow
            }
          })
        },
        stop: (silent) => {
          debug('stopFlow')
          delete ctx.session.__flow
        },
        restart: (state) => {
          debug('restartFlow')
          const flowSession = ctx.session.__flow
          if (!flowSession || !flowSession.flowId) {
            return Promise.resolve()
          }
          return ctx.flow.start(flowSession.flowId, Object.assign({}, flowSession.state, state))
        }
      }

      if (ctx.message && ctx.message.text && self.cancelCommands.indexOf(ctx.message.text) !== -1) {
        return ctx.flow.stop()
      }

      const flowSession = ctx.session.__flow
      debug('flow session', flowSession, self.flows)
      if (flowSession && flowSession.flowId && self.flows[flowSession.flowId] && self.flows[flowSession.flowId].handlers.length > 0) {
        ctx.state.flow = Object.assign({}, flowSession.state)
        const currentFlow = self.flows[flowSession.flowId]
        return compose(currentFlow.handlers)(ctx).finally(() => {
          if (ctx.session.__flow) {
            ctx.session.__flow.state = ctx.state.flow
          }
        })
      } else if (self.defaultFlow) {
        return compose(self.defaultFlow.handlers)(ctx).finally(() => {
          if (ctx.session.__flow) {
            ctx.session.__flow.state = ctx.state.flow
          }
        })
      }
      return next()
    }
  }
}

TelegrafFlow.Flow = Flow

module.exports = TelegrafFlow
