var debug = require('debug')('telegraf:flow')
var compose = require('telegraf').compose

var flow = TelegrafFlow.prototype
module.exports = TelegrafFlow

function TelegrafFlow (opts) {
  opts = Object.assign({
    flows: {},
    cancelCommands: ['/cancel']
  }, opts)
  this.flows = opts.flows
}

flow.registerFlow = function (id, startHandlers, handlers, endHandlers) {
  if (!id) {
    throw new Error('Flow id is empty')
  }
  this.flows[id] = this.flows[id] || { handlers: [], startHandlers: [], endHandlers: [] }
  if (startHandlers) {
    this.flows[id].startHandlers = this.flows[id].startHandlers.concat(startHandlers)
  }
  if (handlers) {
    this.flows[id].handlers = this.flows[id].handlers.concat(handlers)
  }
  if (endHandlers) {
    this.flows[id].endHandlers = this.flows[id].endHandlers.concat(endHandlers)
  }
  return this
}

flow.onFlowStart = function (id) {
  var startHandlers = [].slice.call(arguments, 1)
  return this.registerFlow(id, startHandlers)
}

flow.onFlow = function (id) {
  var handlers = [].slice.call(arguments, 1)
  return this.registerFlow(id, null, handlers)
}

flow.onFlowEnd = function (id) {
  var handlers = [].slice.call(arguments, 1)
  return this.registerFlow(id, null, null, handlers)
}

flow.middleware = function () {
  var allFlows = this.flows

  return function * (next) {
    var context = this

    if (!this.session) {
      throw new Error("Can't find session")
    }

    var flowSession = this.session.__flow

    this.flow = {
      start: function * (id, state, silent) {
        debug('startFlow', id)
        if (!id) {
          throw new Error('Flow id is empty')
        }
        context.session.__flow = {
          flowId: id,
          state: state
        }
        context.state.flow = Object.assign({}, state)
        if (!silent && allFlows[id] && allFlows[id].startHandlers) {
          yield compose(allFlows[id].startHandlers)
        }
        if (context.session.__flow) {
          context.session.__flow.state = context.state.flow
        }
      },

      stop: function * (silent) {
        if (!silent && flowSession && flowSession.flowId && allFlows[flowSession.flowId] && allFlows[flowSession.flowId].endHandlers.length > 0) {
          yield compose(allFlows[flowSession.flowId].endHandlers)
        }
        delete context.session.__flow
        context.state.flow = {}
      }
    }

    if (this.message && this.message.text && context.cancelCommands.indexOf(this.message.text) !== -1) {
      yield this.flow.stop()
      return
    }

    if (flowSession && flowSession.flowId && allFlows[flowSession.flowId] && allFlows[flowSession.flowId].handlers.length > 0) {
      var currentFlow = allFlows[flowSession.flowId]
      this.state.flow = Object.assign({}, flowSession.state)
      yield compose(currentFlow.handlers)
      if (this.session.__flow) {
        this.session.__flow.state = this.state.flow
      }
    } else {
      yield next
    }
  }
}
