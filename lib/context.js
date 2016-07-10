const debug = require('debug')('telegraf:flow')

class FlowContext {

  constructor (ctx, flows) {
    this.ctx = ctx
    this.flows = flows
  }

  start (id, state, silent) {
    debug('start flow', id)
    if (!id) {
      throw new Error('Flow id is empty')
    }
    this.ctx.session.__flow = {
      flowId: id,
      state: state
    }
    this.ctx.state.flow = Object.assign({}, state)
    if (silent || !this.flows[id] || !this.flows[id].startMiddlewares) {
      return Promise.resolve()
    }
    return this.flows[id].startMiddleware()(this.ctx).finally(() => {
      if (this.ctx.session.__flow) {
        this.ctx.session.__flow.state = this.ctx.state.flow
      }
    })
  }

  stop (silent) {
    debug('stop flow')
    delete this.ctx.session.__flow
    delete this.ctx.state.flow
  }

  restart (state) {
    debug('restartFlow')
    const flowSession = this.ctx.session.__flow
    if (!flowSession || !flowSession.flowId) {
      return Promise.resolve()
    }
    return this.ctx.flow.start(flowSession.flowId, Object.assign({}, flowSession.state, state))
  }
}

module.exports = FlowContext
