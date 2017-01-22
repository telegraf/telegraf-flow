const { Composer, compose, lazy, passThru } = require('telegraf')
const FlowContext = require('./context')

class Flow extends Composer {
  constructor (scenes, options) {
    super()
    this.options = Object.assign({sessionName: 'session'}, options)
    this.scenes = new Map()
    if (scenes) {
      scenes.forEach((scene) => this.register(scene))
    }
  }

  register (scene) {
    if (!scene || !scene.id || !scene.middleware) {
      throw new Error('telegraf-flow: Unsupported scene')
    }
    this.scenes.set(scene.id, scene)
    return this
  }

  middleware () {
    return compose([
      (ctx, next) => {
        if (!ctx[this.options.sessionName]) {
          throw new Error("telegraf-flow: Can't find session.")
        }
        ctx.flow = new FlowContext(ctx, this.scenes, this.options)
        return next()
      },
      super.middleware(),
      lazy((ctx) => ctx.flow.current || passThru())
    ])
  }

  static enter (...args) {
    return (ctx) => ctx.flow.enter(...args)
  }
}

module.exports = Flow
