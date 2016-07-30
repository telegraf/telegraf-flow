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
    this.session.state = value
  }

  get history () {
    this.session.history = this.session.history || []
    return this.session.history
  }

  get current () {
    return (this.session.id && this.flows.has(this.session.id)) ? this.flows.get(this.session.id) : null
  }

  start (id, payload, silent, trackHistory = true) {
    if (!id || !this.flows.has(id)) {
      throw new Error(`Can't find flow: ${id}`)
    }
    if (trackHistory && this.current) {
      this.history.push({
        id: this.current.id,
        state: this.state
      })
    }
    this.session.id = id
    this.state = Object.assign({}, payload)
    return silent ? Promise.resolve() : this.current.startMiddleware()(this.ctx)
  }

  restart (state) {
    return this.current ? this.start(this.current.id, state, false, false) : Promise.resolve()
  }

  reset () {
    delete this.ctx.session._flow
    return Promise.resolve()
  }

  canGoBack () {
    return this.history.length > 0
  }

  complete (payload) {
    if (!this.canGoBack()) {
      return this.reset()
    }
    const flow = this.history.pop()
    return this.start(flow.id, flow.state, true, false).then(() => {
      this.result = payload
      return this.current.completeMiddleware()(this.ctx)
    })
  }

  back (silent) {
    if (!this.canGoBack()) {
      return this.reset()
    }
    const flow = this.history.pop()
    return this.start(flow.id, flow.state, silent, false)
  }

  stop () {
    return this.back(null, true)
  }
}

module.exports = FlowContext
