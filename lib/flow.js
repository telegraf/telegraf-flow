const debug = require('debug')('telegraf:flow')
const compose = require('telegraf').compose

class TelegrafFlow {

  constructor (opts) {
    const options = Object.assign({
      flows: {},
      cancelCommands: ['/cancel']
    }, opts)
    this.cancelCommands = options.cancelCommands
    this.flows = options.flows
  }

  registerFlow (id, startHandlers, handlers, endHandlers) {
    if (!id) {
      throw new Error('Flow id is empty')
    }
    this.flows[id] = this.flows[id] || { handlers: [], startHandlers: [], endHandlers: [] }
    if (startHandlers) {
      this.flows[id].startHandlers = this.flows[id].startHandlers.concat(startHandlers)
    }
    if (handlers) {
      this.flows[id].handlers = this.flows[id].handlers.concat(handlers)
    }
    if (endHandlers) {
      this.flows[id].endHandlers = this.flows[id].endHandlers.concat(endHandlers)
    }
    return this
  }

  registerDefaultHandlers () {
    const handlers = [].slice.call(arguments)
    this.flows.__default = handlers
    return this
  }

  onFlowStart (id) {
    const startHandlers = [].slice.call(arguments, 1)
    return this.registerFlow(id, startHandlers)
  }

  onFlow (id) {
    const handlers = [].slice.call(arguments, 1)
    return this.registerFlow(id, null, handlers)
  }

  onFlowEnd (id) {
    const handlers = [].slice.call(arguments, 1)
    return this.registerFlow(id, null, null, handlers)
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
          if (!silent && self.flows[id] && self.flows[id].startHandlers) {
            return compose(self.flows[id].startHandlers)(ctx).finally(() => {
              if (ctx.session.__flow) {
                ctx.session.__flow.state = ctx.state.flow
              }
            })
          }
          return Promise.resolve()
        },
        stop: (silent) => {
          debug('stopFlow')
          const flowSession = ctx.session.__flow
          if (!silent && flowSession && flowSession.flowId && self.flows[flowSession.flowId]) {
            return compose(self.flows[flowSession.flowId].endHandlers)(ctx).finally(() => {
              delete ctx.session.__flow
            })
          }
          delete ctx.session.__flow
          return Promise.resolve()
        },
        restart: (state) => {
          debug('restartFlow')
          const flowSession = ctx.session.__flow
          if (flowSession && flowSession.flowId) {
            return ctx.flow.start(flowSession.flowId, Object.assign({}, flowSession.state, state))
          }
          return Promise.resolve()
        }
      }

      if (ctx.message && ctx.message.text && self.cancelCommands.indexOf(ctx.message.text) !== -1) {
        return ctx.flow.stop()
      }

      const flowSession = ctx.session.__flow
      debug('flowSession', flowSession)
      if (flowSession && flowSession.flowId && self.flows[flowSession.flowId] && self.flows[flowSession.flowId].handlers.length > 0) {
        const currentFlow = self.flows[flowSession.flowId]
        ctx.state.flow = Object.assign({}, flowSession.state)
        return compose(currentFlow.handlers)(ctx).finally(() => {
          if (ctx.session.__flow) {
            ctx.session.__flow.state = ctx.state.flow
          }
        })
      } else if (self.flows.__default) {
        return compose(self.flows.__default)(ctx).finally(() => {
          if (ctx.session.__flow) {
            ctx.session.__flow.state = ctx.state.flow
          }
        })
      }
      return next()
    }
  }
}

module.exports = TelegrafFlow
