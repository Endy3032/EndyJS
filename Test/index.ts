import "dotenv/config"
import flags from "flags"
import * as Discord from "discordeno"
import { readdirSync } from "node:fs"
import { ApplicationCommandOptionTypes, DiscordApplicationCommand, DiscordApplicationCommandOption } from "discordeno"

const token = process.env.Token
if (!token) throw new Error("No token specified")

flags.defineString("mode", null, "The mode to deploy the commands.")
flags.parse()
const mode = flags.get("mode")

var clientOptions: Discord.CreateBotOptions = {
  botId: 699911346367627374n,
  events: {},
  intents: ["Guilds", "DirectMessages"],
  token: process.env.Token as string,
}

readdirSync("./events").filter(file => file.endsWith(".ts")).forEach(async file => {
  const event = require(`./events/${file}`)
  const [eventName] = file.split(".")
  clientOptions.events[eventName] = event
})

const client = Discord.createBot(clientOptions)

function replaceDescription(cmd: DiscordApplicationCommand, tag: string) {
  if (cmd.type == 2 || cmd.type == 3) {return cmd.name = `[${tag}] ${cmd.name}`}

  cmd.description = `[${tag}] ${cmd.description} [${tag}]`
  cmd.options?.forEach(sub1 => {
    if (sub1.type == ApplicationCommandOptionTypes.SubCommand) {
      sub1.description = `[${tag}] ${sub1.description} [${tag}]`
    } else if (sub1.type == ApplicationCommandOptionTypes.SubCommandGroup) {
      sub1.options?.forEach(sub2 => {
        sub2.description = `[${tag}] ${sub2.description} [${tag}]`
      })
    }
  })

  return cmd
}

if (mode != "guilds") {
  const commandFiles = readdirSync("./Commands").filter(file => file.endsWith(".ts"))
  commandFiles.forEach(async command => {
    let { cmd } = await import(`./Commands/${command}`)
    if (mode == "test") {cmd = replaceDescription(cmd, "D")}
    await client.helpers.createApplicationCommand(cmd, mode == "test" ? BigInt(process.env.TestGuild as string) : undefined)
  })
} else {
  const guildFolders = readdirSync("./Commands/Guilds")
  guildFolders.forEach(guildID => {
    const commandFiles = readdirSync(`./guilds/${guildID}`).filter(file => file.endsWith(".ts"))
    commandFiles.forEach(async command => {
      let { cmd } = require(`./Commands/Guilds/${guildID}/${command}`)
      cmd = replaceDescription(cmd, "G")
      await client.helpers.createApplicationCommand(cmd, BigInt(guildID))
    })
  })
}

// console.botLog = async(content: string, level: LogLevel = LogLevel.Info) => {

// }

Discord.startBot(client)