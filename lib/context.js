const debug = require('debug')('telegraf:flow:context')

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
    debug('enter', sceneId, initialState, silent)
    this.session.id = sceneId
    this.state = initialState
    if (silent) {
      return
    }
    const handler = this.current.enterMiddleware
      ? this.current.enterMiddleware()
      : this.current.middleware()
    return handler(this.ctx, () => undefined)
  }

  reenter () {
    return this.enter(this.session.id, this.state)
  }

  leave () {
    debug('leave')
    delete this.ctx.session._flow
  }
}

module.exports = FlowContext
