const { Composer, compose } = require('telegraf')

class GenericScene extends Composer {
  constructor (id, options) {
    const opts = Object.assign({
      handlers: [],
      enterHandlers: [],
      leaveHandlers: []
    }, options)
    super(...opts.handlers)
    this.id = id
    this.options = opts
    this.enterHandler = compose(opts.enterHandlers)
    this.leaveHandler = compose(opts.leaveHandlers)
  }

  get ttl () {
    return this.options.ttl
  }

  enter (...fns) {
    this.enterHandler = compose([this.enterHandler, ...fns])
    return this
  }

  leave (...fns) {
    this.leaveHandler = compose([this.leaveHandler, ...fns])
    return this
  }

  enterMiddleware () {
    return this.enterHandler
  }

  leaveMiddleware () {
    return this.leaveHandler
  }
}

module.exports = GenericScene
