const debug = require('debug')('telegraf:flow')

class FlowContext {

  constructor (ctx, flows) {
    this.ctx = ctx
    this.flows = flows
  }

  stop () {
    debug('stop flow')
    delete this.ctx.session.__flow
    delete this.ctx.state.flow
    return Promise.resolve()
  }

  start (id, state, silent, trackHistory = true) {
    debug('start flow', id, state)
    if (!id) {
      throw new Error('Flow id is empty')
    }
    var { flowId, history } = (this.ctx.session.__flow || {})
    history = history || []
    if (trackHistory && flowId && flowId !== id) {
      history.push(flowId)
    }
    this.ctx.session.__flow = {
      flowId: id,
      state: state,
      history: history
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

  restart () {
    debug('restart flow')
    const { flowId, state } = (this.ctx.session.__flow || {})
    if (!flowId) {
      return Promise.resolve()
    }
    return this.ctx.flow.start(flowId, state, false)
  }

  canGoBack () {
    const { history } = (this.ctx.session.__flow || {})
    return (history || []).length > 0
  }

  back (state, silent) {
    debug('back', state)
    if (!this.canGoBack()) {
      return this.stop()
    }
    return this.ctx.flow.start(this.session.history.pop(), Object.assign({}, state), silent, false)
  }
}

module.exports = FlowContext
