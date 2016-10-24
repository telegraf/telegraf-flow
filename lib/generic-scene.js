const { Composer, compose } = require('telegraf')

class GenericScene extends Composer {
  constructor (id, options) {
    const opts = Object.assign({
      handlers: [],
      enterHandlers: []
    }, options)
    super(...opts.handlers)
    this.id = id
    this.enterHandler = compose(opts.enterHandlers)
  }

  enter (...fns) {
    this.enterHandler = compose([this.enterHandler, ...fns])
    return this
  }

  enterMiddleware () {
    return this.enterHandler
  }
}

module.exports = GenericScene
