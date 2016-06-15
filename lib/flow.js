const compose = require('telegraf').compose
const mount = require('telegraf').mount

class Flow {

  constructor (id) {
    this.id = id
    this.handlers = []
    this.startHandlers = []
  }

  onStart () {
    const fns = [].slice.call(arguments)
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.startHandlers.push(compose(fns))
    return this
  }

  on (updateTypes) {
    const fns = [].slice.call(arguments, 1)
    if (fns.length === 0) {
      throw new TypeError('At least one Middleware must be provided')
    }
    this.handlers.push(mount(updateTypes, compose(fns)))
    return this
  }

}

module.exports = Flow
