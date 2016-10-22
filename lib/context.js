const noop = () => undefined

class FlowContext {
  constructor (ctx, scenes, options) {
    this.ctx = ctx
    this.scenes = scenes
    this.options = options
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

  get current () {
    return (this.session.id && this.scenes.has(this.session.id)) ? this.scenes.get(this.session.id) : null
  }

  enter (sceneId, initialState, silent) {
    if (!sceneId || !this.scenes.has(sceneId)) {
      throw new Error(`Can't find scene: ${sceneId}`)
    }
    this.session.id = sceneId
    this.state = initialState
    if (silent) {
      return
    }
    return this.current.entertMiddleware
      ? this.current.entertMiddleware()(this.ctx, noop)
      : this.current.middleware()(this.ctx, noop)
  }

  leave () {
    delete this.ctx.session._flow
  }
}

module.exports = FlowContext
