const debug = require('debug')('telegraf:flow')
const compose = require('telegraf').compose

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
    return compose(this.flows[id].startMiddlewares)(this.ctx).finally(() => {
      if (this.ctx.session.__flow) {
        this.ctx.session.__flow.state = this.ctx.state.flow
      }
    })
  }

  stop (silent) {
    debug('stop flow')
    delete this.ctx.session.__flow
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
