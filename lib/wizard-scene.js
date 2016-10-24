class WizardContext {
  constructor (ctx, steps) {
    this.ctx = ctx
    this.steps = steps
    this.state = Object.assign({position: 0}, ctx.flow.session._wizard)
    ctx.flow.session._wizard = this.state
  }

  get step () {
    return this.state.position >= 0 && this.steps[this.state.position]
  }

  selectStep (index) {
    this.state.position = index
    return this
  }

  next () {
    return this.selectStep(this.state.position + 1)
  }

  back () {
    return this.selectStep(this.state.position - 1)
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
