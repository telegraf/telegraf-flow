const { Composer, compose, optional, lazy, safePassThru } = require('telegraf')
const FlowContext = require('./context')

class Flow extends Composer {
  constructor (scenes, options) {
    super()
    this.options = Object.assign({
      sessionName: 'session'
    }, options)
    this.scenes = new Map()
    if (scenes) {
      scenes.forEach((scene) => this.register(scene))
    }
  }

  register (...scenes) {
    scenes.forEach((scene) => {
      if (!scene || !scene.id || !scene.middleware) {
        throw new Error('telegraf-flow: Unsupported scene')
      }
      this.scenes.set(scene.id, scene)
    })
    return this
  }

  middleware () {
    const handler = compose([
      (ctx, next) => {
        ctx.flow = new FlowContext(ctx, this.scenes, this.options)
        return next()
      },
      super.middleware(),
      lazy((ctx) => ctx.flow.current || safePassThru())
    ])
    return optional((ctx) => ctx[this.options.sessionName], handler)
  }

  static enter (...args) {
    return (ctx) => ctx.flow.enter(...args)
  }

  static leave (...args) {
    return (ctx) => ctx.flow.leave(...args)
  }
}

module.exports = Flow
