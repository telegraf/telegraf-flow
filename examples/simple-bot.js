const Telegraf = require('telegraf')
const TelegrafFlow = require('../')
const { Scene, enter, leave } = TelegrafFlow

const flow = new TelegrafFlow()

// Greeter scene
const greeterScene = new Scene('greeter')
greeterScene.enter((ctx) => ctx.reply('Hi'))
greeterScene.leave((ctx) => ctx.reply('Buy'))
greeterScene.hears(/hi/gi, leave())
greeterScene.on('message', (ctx) => ctx.reply('Send `hi`'))

// Echo scene
const echoScene = new Scene('echo')
echoScene.enter((ctx) => ctx.reply('echo scene'))
echoScene.leave((ctx) => ctx.reply('exiting echo scene'))
echoScene.command('back', leave())
echoScene.on('text', (ctx) => ctx.reply(ctx.message.text))
echoScene.on('message', (ctx) => ctx.reply('Only text messages please'))

// Scene registration
flow.register(greeterScene, echoScene)

const app = new Telegraf(process.env.BOT_TOKEN)
app.use(Telegraf.memorySession())
app.use(flow.middleware())
app.command('help', (ctx) => ctx.reply('Help message'))
app.command('greeter', enter('greeter'))
app.command('echo', enter('echo'))
app.startPolling()
