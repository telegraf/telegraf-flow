const { compose, Composer } = require('telegraf')

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

  startMiddleware () {
    return compose(this.startHandlers)
  }

  completeMiddleware () {
    return this.resultHandlers.length > 0 ? compose(this.resultHandlers) : this.startMiddleware()
  }
}

module.exports = Flow
