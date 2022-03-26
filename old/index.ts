import "dotenv/config"
import keepAlive from "./server"
import stripAnsi from "strip-ansi"
import { APIEmbed } from "discord-api-types/v10"
import { capitalize, nordChalk } from "./modules"
import { createWriteStream, readdirSync } from "fs"
import { Client, Collection, GatewayIntentBits, Partials, BaseGuildTextChannel } from "discord.js"

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages], partials: [Partials.Channel] })
const logStream = createWriteStream("./logs/botlog.log", { flags: "a" })

console.botLog = async (content: string, logLevel = "info", embed?: APIEmbed) => {
  const date = new Date()
  const epoch = date.getTime()
  const channel = client.channels.cache.get(process.env.Log as string) as BaseGuildTextChannel
  content = content.replaceAll("    ", "  ").replaceAll(process.cwd(), "EndyJS")
  logLevel = logLevel.toLowerCase()

  const logTime = date.toLocaleString("default", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, fractionalSecondDigits: 2
  }).replace(",", "")

  const consoleLog = nordChalk.blue(`${logTime} ${nordChalk[logLevel](logLevel.padEnd(5, " ").toUpperCase() as string)} ${`| ${content}`}`.replaceAll("\n", "\n                             | "))
  console.log(consoleLog)
  logStream.write(stripAnsi(`${consoleLog}\n`))

  content = stripAnsi(content.replaceAll("[ ", "[").replaceAll(" ]", "]"))

  if (logLevel == "error") {
    return channel.send(`**Timestamp** • ${epoch}\`\`\`${content}\`\`\``)
      .catch((err: Error) => channel.send(`**Timestamp** • ${epoch}\`\`\`${err.stack}\`\`\``))
  }

  if (content.includes("youtu.be")) {
    return channel.send(`**Timestamp** • ${epoch}\n**Status** • Streaming lofi - ${content.split(" Streaming lofi ")[1]}`)
      .catch((err: Error) => channel.send(`**Timestamp** • ${epoch}\`\`\`${err.stack}\`\`\``))
  }

  if (!embed) {
    embed = {
      description: `**Timestamp** • ${epoch}\n**${capitalize(logLevel)}**${logLevel.includes("WARN") ? `\`\`\`${content}\`\`\`` : ` • ${content}`}`,
      timestamp: date.toISOString()
    }
  }

  if (!embed.timestamp) embed.timestamp = date.toISOString()
  if (!embed.description?.includes("**Timestamp** • ")) embed.description = `**Timestamp** • ${epoch}\n${embed.description}`
  try {channel.send({ embeds: [embed] })}
  catch {(err: { stack: any }) => channel.send(`**Timestamp** • ${epoch}\`\`\`${err.stack}\`\`\``)}
}

console.tagLog = async (tag: string, content: string) => {
  console.botLog(`${nordChalk.bright.cyan(`[${tag}]`)} ${content}`)
}

client.commands = new Collection()
const commandFiles = readdirSync("./commands").filter((file) => file.endsWith(".ts"))
commandFiles.forEach(async file => {
  const command = await import(`./commands/${file}`)
  client.commands.set(command.cmd.name, command)
})

const eventFiles = readdirSync("./events").filter((file) => file.endsWith(".ts"))
eventFiles.forEach(async file => {
  const event = await import(`./events/${file}`)
  event.once
    ? client.once(event.name, (...args) => event.execute(...args))
    : client.on(event.name, (...args) => event.execute(...args))
})

client.login(process.env.Token as string)
keepAlive()

process.setMaxListeners(0)

// console.log(client.commands)
// DELETE ALL COMMANDS: client.application.commands.set([])