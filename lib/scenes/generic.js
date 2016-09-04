const { compose, optional, passThru, Composer } = require('telegraf')

class GenericScene extends Composer {
  constructor (id, ...handlers) {
    super(...handlers)
    this.id = id
    this.resultHandlers = []
    this.startHandlers = []
  }

  onStart (...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.startHandlers.push(compose(fns))
    return this
  }

  onResult (...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.resultHandlers.push(compose(fns))
    return this
  }

  onResultFrom (sceneId, ...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.resultHandlers.push(optional((ctx) => {
      return ctx.flow.calee === sceneId
    }, compose(fns)))
    return this
  }

  startHandler () {
    return compose(this.startHandlers)
  }

  resultHandler () {
    return this.resultHandlers.length > 0 ? compose(this.resultHandlers) : passThru()
  }
}

module.exports = GenericScene
