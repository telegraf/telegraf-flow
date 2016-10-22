class WizardContext {
  constructor (ctx, steps) {
    this.ctx = ctx
    this.steps = steps
    this.state = Object.assign({cursor: 0}, ctx.flow.session._wizard)
    ctx.flow.session._wizard = this.state
  }

  get step () {
    return this.state.cursor >= 0 && this.steps[this.state.cursor]
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
        return ctx.flow.stop()
      }
      return wizard.step(ctx, next)
    }
  }
}

module.exports = WizardScene
