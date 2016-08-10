const { compose, optional, passThru, Composer } = require('telegraf')

class Flow extends Composer {
  constructor (id) {
    super()
    if (!id) {
      throw new TypeError('Flow id must be provided')
    }
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

  onResultFrom (flowId, ...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.resultHandlers.push(optional((ctx) => {
      return ctx.flow.calee === flowId
    }, compose(fns)))
    return this
  }

  startMiddleware () {
    return compose(this.startHandlers)
  }

  resultMiddleware () {
    return this.resultHandlers.length > 0 ? compose(this.resultHandlers) : passThru()
  }
}

module.exports = Flow
