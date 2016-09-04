class WizardScene {
  constructor (id, ...handlers) {
    this.id = id
    this.handlers = handlers
  }

  middleware () {
    return (ctx, next) => {
      const wizard = new WizardContext(ctx, this.handlers)
      ctx.flow.wizard = wizard
      if (!wizard.handler) {
        wizard.selectStep(0)
        return ctx.flow.complete()
      }
      return wizard.handler(ctx, next)
    }
  }
}

class WizardContext {
  constructor (ctx, handlers) {
    this.ctx = ctx
    this.handlers = handlers
    this.state = Object.assign({cursor: 0}, ctx.flow.session._wizard)
    ctx.flow.session._wizard = this.state
  }

  get handler () {
    return this.state.cursor >= 0 && this.handlers[this.state.cursor]
  }

  selectStep (index) {
    this.state.cursor = index
    return this
  }

  next () {
    return this.selectStep(this.state.cursor + 1)
  }

  back () {
    return this.selectStep(this.state.cursor - 1)
  }
}

module.exports = WizardScene
