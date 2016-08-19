const debug = require('debug')('telegraf:flow')
const noop = () => undefined

class FlowContext {
  constructor (ctx, flows, options) {
    this.ctx = ctx
    this.flows = flows
    this.options = options
    this.flashValue = this.session.flash
    delete this.session.flash
  }

  get session () {
    const sessionName = this.options.sessionName
    this.ctx[sessionName]._flow = this.ctx[sessionName]._flow || {}
    return this.ctx[sessionName]._flow
  }

  get state () {
    this.session.state = this.session.state || {}
    return this.session.state
  }

  set state (value) {
    this.session.state = Object.assign({}, value)
  }

  get flash () {
    return this.flashValue
  }

  set flash (value) {
    this.session.flash = value
  }

  get history () {
    this.session.history = this.session.history || []
    return this.session.history
  }

  get current () {
    return (this.session.id && this.flows.has(this.session.id)) ? this.flows.get(this.session.id) : null
  }

  start (id, state, silent) {
    debug('start', id, state, silent)
    if (!id || !this.flows.has(id)) {
      throw new Error(`Can't find flow: ${id}`)
    }
    delete this.result
    delete this.calee
    if (this.current) {
      this.history.push({
        id: this.current.id,
        state: this.state
      })
    }
    this.session.id = id
    this.state = state
    return silent ? Promise.resolve() : this.current.startMiddleware()(this.ctx, noop)
  }

  restart () {
    return this.current.startMiddleware()(this.ctx, noop)
  }

  canGoBack () {
    return this.history.length > 0
  }

  complete (result) {
    if (!this.canGoBack()) {
      return this.reset()
    }
    const flow = this.history.pop()
    this.calee = this.current && this.current.id
    this.result = result
    this.session.id = flow.id
    this.state = flow.state
    return this.current.resultMiddleware()(this.ctx, noop)
  }

  back (silent) {
    if (!this.canGoBack()) {
      return this.reset()
    }
    const flow = this.history.pop()
    this.session.id = flow.id
    this.state = flow.state
    delete this.result
    delete this.calee
    return silent ? Promise.resolve() : this.current.startMiddleware()(this.ctx, noop)
  }

  stop () {
    return this.back(null, true)
  }

  clearHistory () {
    this.session.history = []
    return Promise.resolve()
  }

  reset () {
    delete this.ctx.session._flow
    return Promise.resolve()
  }
}

module.exports = FlowContext
