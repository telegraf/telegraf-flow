class FlowContext {
  constructor (ctx, flows) {
    this.ctx = ctx
    this.flows = flows
  }

  get session () {
    this.ctx.session._flow = this.ctx.session._flow || {}
    return this.ctx.session._flow
  }

  get state () {
    this.session.state = this.session.state || {}
    return this.session.state
  }

  set state (value) {
    this.session.state = Object.assign({}, value)
  }

  get history () {
    this.session.history = this.session.history || []
    return this.session.history
  }

  get current () {
    return (this.session.id && this.flows.has(this.session.id)) ? this.flows.get(this.session.id) : null
  }

  startForResult (id, state, silent) {
    return this.start(id, state, silent, true)
  }

  start (id, state, silent, addToHistory) {
    if (!id || !this.flows.has(id)) {
      throw new Error(`Can't find flow: ${id}`)
    }
    if (addToHistory && this.current) {
      this.history.push({
        id: this.current.id,
        state: this.state
      })
    }
    this.session.id = id
    this.state = state
    return silent ? Promise.resolve() : this.current.startMiddleware()(this.ctx)
  }

  restart (state) {
    return this.current ? this.start(this.current.id, state) : Promise.resolve()
  }

  reset () {
    delete this.ctx.session._flow
    return Promise.resolve()
  }

  canGoBack () {
    return this.history.length > 0
  }

  complete (state) {
    if (!this.canGoBack()) {
      return this.reset()
    }
    const flow = this.history.pop()
    return this.start(flow.id, flow.state, true).then(() => {
      this.result = state
      return this.current.completeMiddleware()(this.ctx)
    })
  }

  back (silent) {
    if (!this.canGoBack()) {
      return this.reset()
    }
    const flow = this.history.pop()
    return this.start(flow.id, flow.state, silent)
  }

  stop () {
    return this.back(null, true)
  }
}

module.exports = FlowContext
