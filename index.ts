import "dotenv/config"
import * as Discord from "discordeno"
import { readdirSync } from "node:fs"

const token = process.env.Token
if (!token) throw new Error("No token specified")

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

// console.botLog = async(content: string, level: LogLevel = LogLevel.Info) => {

// }

Discord.startBot(client)