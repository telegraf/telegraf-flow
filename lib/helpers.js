function ensureState (field, failFn) {
  return (ctx, next) => {
    const failHandler = failFn || ctx.flow.back
    return ctx.flow && ctx.flow.state && ctx.flow.state[field] ? next() : failHandler()
  }
}

module.exports = {
  ensureState: ensureState
}
