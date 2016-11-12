class WizardContext {
  constructor (ctx, steps) {
    this.ctx = ctx
    this.steps = steps
    this.state = ctx.flow.state
    this.state._pos = this.state._pos || 0
  }

  get step () {
    return this.state._pos >= 0 && this.steps[this.state._pos]
  }

  selectStep (index) {
    this.state._pos = index
    return this
  }

  next () {
    return this.selectStep(this.state._pos + 1)
  }

  back () {
    return this.selectStep(this.state._pos - 1)
  }
}

class WizardScene {
  constructor (id, ...steps) {
    this.id = id
    this.steps = steps
  }

  middleware () {
    return (ctx, next) => {
      const wizard = new WizardContext(ctx, this.steps)
      ctx.flow.wizard = wizard
      if (!wizard.step) {
        wizard.selectStep(0)
        return ctx.flow.leave()
      }
      return wizard.step(ctx, next)
    }
  }
}

module.exports = WizardScene
