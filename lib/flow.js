const compose = require('telegraf').compose
const mount = require('telegraf').mount
const hears = require('telegraf').hears

class Flow {

  constructor (id) {
    this.id = id
    this.middlewares = []
    this.startMiddlewares = []
  }

  onStart () {
    const fns = [].slice.call(arguments)
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.startMiddlewares.push(compose(fns))
    return this
  }

  on (updateTypes) {
    const fns = [].slice.call(arguments, 1)
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.middlewares.push(mount(updateTypes, compose(fns)))
    return this
  }

  hears (triggers) {
    const fns = [].slice.call(arguments, 1)
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    const middleware = compose(fns)
    this.middlewares.push(hears(triggers, middleware))
    return this
  }

  command () {
    return this.hears.apply(this, arguments)
  }

  middleware () {
    return compose(this.middlewares)
  }

  startMiddleware () {
    return compose(this.startMiddlewares)
  }

}

module.exports = Flow
