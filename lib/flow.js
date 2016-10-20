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
      throw new Error('TelegrafFlow: Invalid scene')
    }
    this.scenes.set(scene.id, scene)
    return this
  }

  setDefault (scene) {
    this.register(scene)
    this.defaultSceneId = scene.id
    return this
  }

  middleware () {
    return (ctx, next) => {
      if (!ctx[this.options.sessionName]) {
        throw new Error("TelegrafFlow: Can't find session.")
      }
      ctx.flow = new FlowContext(ctx, this.scenes, this.options)
      const scene = ctx.flow.current
      if (!scene && this.defaultSceneId) {
        ctx.flow.clearHistory()
        return ctx.flow.start(this.defaultSceneId, null, true).then(() => {
          return ctx.flow.current.middleware()(ctx, next)
        })
      }
      return scene ? scene.middleware()(ctx, next) : next()
    }
  }
}

module.exports = TelegrafFlow
