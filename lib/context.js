const debug = require('debug')('telegraf:flow')
const noop = () => undefined

class FlowContext {
  constructor (ctx, scenes, options) {
    this.ctx = ctx
    this.scenes = scenes
    this.options = options
    this.flashValue = this.session._flash
    delete this.session._flash
  }

  get session () {
    const sessionName = this.options.sessionName
    this.ctx[sessionName]._flow = this.ctx[sessionName]._flow || {}
    return this.ctx[sessionName]._flow
  }

  get state () {
    this.session._state = this.session._state || {}
    return this.session._state
  }

  set state (value) {
    this.session._state = Object.assign({}, value)
  }

  get flash () {
    return this.flashValue
  }

  set flash (value) {
    this.session._flash = value
  }

  get history () {
    this.session.history = this.session.history || []
    return this.session.history
  }

  get current () {
    return (this.session.id && this.scenes.has(this.session.id)) ? this.scenes.get(this.session.id) : null
  }

  start (id, state, silent) {
    debug('start scene', id, state, silent)
    if (!id || !this.scenes.has(id)) {
      throw new Error(`Can't find scene: ${id}`)
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
    return silent ? Promise.resolve() : this.restart()
  }

  restart () {
    return this.current.startHandler
      ? this.current.startHandler()(this.ctx, noop)
      : this.current.middleware()(this.ctx, noop)
  }

  canGoBack () {
    return this.history.length > 0
  }

  complete (result) {
    if (!this.canGoBack()) {
      return this.reset()
    }
    const scene = this.history.pop()
    this.calee = this.current && this.current.id
    this.result = result
    this.session.id = scene.id
    this.state = scene.state
    return this.current.resultHandler ? this.current.resultHandler()(this.ctx, noop) : Promise.resolve()
  }

  back (silent) {
    if (!this.canGoBack()) {
      return this.reset()
    }
    const scene = this.history.pop()
    this.session.id = scene.id
    this.state = scene.state
    delete this.result
    delete this.calee
    return silent ? Promise.resolve() : this.restart()
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
