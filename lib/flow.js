const FlowContext = require('./context')

class TelegrafFlow {
  constructor (scenes, options) {
    this.options = Object.assign({sessionName: 'session'}, options)
    this.scenes = new Map()
    if (scenes) {
      scenes.forEach((scene) => this.register(scene))
    }
  }

  register (scene) {
    if (!scene || !scene.id || !scene.middleware) {
      throw new Error('TelegrafFlow: Unsupported scene')
    }
    this.scenes.set(scene.id, scene)
    return this
  }

  setDefault (scene) {
    this.register(scene)
    this.defaultScene = scene
    return this
  }

  middleware () {
    return (ctx, next) => {
      if (!ctx[this.options.sessionName]) {
        throw new Error("TelegrafFlow: Can't find session.")
      }
      ctx.flow = new FlowContext(ctx, this.scenes, this.options)
      if (!ctx.flow.current && this.defaultScene) {
        ctx.flow.enter(this.defaultScene.id, null, true)
      }
      return ctx.flow.current
        ? ctx.flow.current.middleware()(ctx, next)
        : next()
    }
  }
}

module.exports = TelegrafFlow
