require("events").EventEmitter.defaultMaxListeners = 6
const fs = require("fs")
const keepAlive = require("./server")
const stripAnsi = require("strip-ansi")
const { nordChalk } = require("./other/misc")
const { Client, Collection, GatewayIntentBits } = require("discord.js")

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
var logStream = fs.createWriteStream("./logs/botlog.log", { flags: "a" })

async function log(content, logLevel = "INFO") {
  const date = new Date()
  epoch = Math.floor(date.getTime() / 1000)
  const channel = client.channels.cache.get(process.env.LOG)

  logLevelColors = {
    INFO: nordChalk.info,
    WARN: nordChalk.warn,
    ERROR: nordChalk.error,
    DEBUG: nordChalk.debug,
  }

  logTime = date.toLocaleString("default", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",

    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 2
  }).replace(",", "")

  consoleLog = `${nordChalk.blue(logTime)} ${logLevelColors[logLevel](`${logLevel} `.substring(0, 5))} ${nordChalk.blue(`| ${content}`)}`.replaceAll("\n", nordChalk.blue("\n                             | "))
  console.log(consoleLog)
  logStream.write(stripAnsi(`${consoleLog}\n`))
  channel.send(stripAnsi(`[<t:${epoch}:d> <t:${epoch}:T>]\n${content}`))
}

client.commands = new Collection()
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"))
commandFiles.forEach((file) => {
  const command = require(`./commands/${file}`)
  client.commands.set(command.cmd.name, command)
})

const eventFiles = fs.readdirSync("./events").filter((file) => file.endsWith(".js"))
eventFiles.forEach((file) => {
  const event = require(`./events/${file}`)

  event.once
    ? client.once(event.name, (...args) => event.execute(...args))
    : client.on(event.name, (...args) => event.execute(...args))
})

client.login(process.env.TOKEN)
keepAlive()

module.exports.log = log

// console.log(client.commands)
// DELETE ALL COMMANDS
// client.application.commands.set([])