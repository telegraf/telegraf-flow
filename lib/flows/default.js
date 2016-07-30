const { compose, mount, hears } = require('telegraf')

class Flow {
  constructor (id) {
    this.id = id || 'default-flow'
    this.handlers = []
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

  on (updateTypes, ...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.handlers.push(mount(updateTypes, compose(fns)))
    return this
  }

  hears (triggers, ...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.handlers.push(hears(triggers, compose(fns)))
    return this
  }

  command (...args) {
    return this.hears(...args)
  }

  middleware () {
    return compose(this.handlers)
  }

  startMiddleware () {
    return compose(this.startHandlers)
  }

  completeMiddleware () {
    return this.resultHandlers.length > 0 ? compose(this.resultHandlers) : this.startMiddleware()
  }
}

module.exports = Flow
