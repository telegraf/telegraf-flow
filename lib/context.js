const debug = require('debug')('telegraf:flow:context')
const { safePassThru } = require('telegraf')

const noop = () => Promise.resolve()
const now = () => Math.floor(new Date().getTime() / 1000)

class FlowContext {
  constructor (ctx, scenes, options) {
    this.ctx = ctx
    this.scenes = scenes
    this.options = options
  }

  get session () {
    const sessionName = this.options.sessionName
    this.ctx[sessionName]._flow = this.ctx[sessionName]._flow || {}
    if (this.ctx[sessionName]._flow._expires < now()) {
      this.ctx[sessionName]._flow = {}
    }
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
    const sceneId = this.session.id || this.options.defaultScene
    return (sceneId && this.scenes.has(sceneId)) ? this.scenes.get(sceneId) : null
  }

  enter (sceneId, initialState, silent) {
    if (!sceneId || !this.scenes.has(sceneId)) {
      throw new Error(`Can't find scene: ${sceneId}`)
    }
    debug('enter', sceneId, initialState, silent)
    this.session.id = sceneId
    this.state = initialState
    const ttl = this.current.ttl || this.options.ttl
    if (ttl) {
      this.session._expires = now() + ttl
    }
    if (silent) {
      return
    }
    const handler = this.current.enterMiddleware
      ? this.current.enterMiddleware()
      : this.current.middleware()
    return handler(this.ctx, noop)
  }

  reenter () {
    return this.enter(this.session.id, this.state)
  }

  leave () {
    debug('leave')
    const handler = this.current && this.current.leaveMiddleware
      ? this.current.leaveMiddleware()
      : safePassThru()
    return handler(this.ctx, noop).then(() => delete this.ctx.session._flow)
  }
}

module.exports = FlowContext
