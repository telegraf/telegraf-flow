const { compose, passThru, Composer } = require('telegraf')

class GenericScene extends Composer {
  constructor (id, ...handlers) {
    super(...handlers)
    this.id = id
    this.enterHandlers = []
  }

  enter (...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one middleware must be provided')
    }
    this.enterHandlers.push(compose(fns))
    return this
  }

  entertMiddleware () {
    return this.enterHandlers.length > 0 ? compose(this.enterHandlers) : passThru()
  }
}

module.exports = GenericScene
