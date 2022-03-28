import "dotenv/config"
import flags from "flags"
// var flags = require("flags")

import fs from "fs"
import { deployLog } from "./modules"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v10"

flags.defineString("mode", "global", "The mode to deploy the commands.")
flags.parse()

const mode = flags.get("mode")
const rest = new REST({ version: "10" }).setToken(process.env.Token as string)
deployLog("Deploy", "Refreshing application commands...")

if (mode != "guilds") {
  const commands = [] as any //.map(command => command.toJSON());
  const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))

  commandFiles.forEach(async command => {
    const { cmd } = await import(`./commands/${command}`)
    if (mode != "test") return commands.push(cmd)
    if (cmd.type == 2 || cmd.type == 3) {
      cmd.name = `[D] ${cmd.name}`
      return commands.push(cmd)
    }

    cmd.description = `[Development] ${cmd.description} [Development]`
    cmd.options?.forEach((option: { description: string; options: any[] }) => option.description = `[Development] ${option.description} [Development]`)
    cmd.options?.options?.forEach((option: { description: string; options: any[] }) => {option.description = `[Development] ${option.description} [Development]`})
    commands.push(cmd)
  });

  (async () => {
    try {
      await rest.put(
        mode == "global"
          ? Routes.applicationCommands(process.env.Client as string)
          : Routes.applicationGuildCommands(process.env.Client as string, process.env.TestGuild as string),
        { body: commands },
      )
      deployLog("Deploy", `Registered ${commandFiles.length} ${mode} commands.`)
    } catch (err) {console.error(err)}
  })()
} else {
  const guildFolders = fs.readdirSync("./commands/guilds")

  guildFolders.forEach(guildID => {
    const commands = [] as any
    const commandFiles = fs.readdirSync(`./guilds/${guildID}`).filter(file => file.endsWith(".js"))

    commandFiles.forEach(async command => {
      // const { cmd } = require(`./commands/guilds/${guildId}/${command}`)

      // if (cmd.type == 1 || cmd.type == null) {
      //   cmd.description = `[G] ${cmd.description}`
      //   if (cmd.options) {cmd.options.forEach(option => {
      //     option.description = `[G] ${option.description}`
      //     if (option.options) option.options.forEach(option => {option.description = `[G] ${option.description}`})
      //   })}
      // } else if (cmd.type == 2 || cmd.type == 3) cmd.name = `[G] ${cmd.name}`

      // commands.push(cmd)
      const { cmd } = await import(`./commands/guilds/${guildID}/${command}`)
      if (cmd.type == 2 || cmd.type == 3) {
        cmd.name = `[G] ${cmd.name}`
        return commands.push(cmd)
      }

      cmd.description = `[G] ${cmd.description} [G]`
      cmd.options?.forEach((option: { description: string; options: any[] }) => option.description = `[G] ${option.description} [G]`)
      cmd.options?.options?.forEach((option: { description: string; options: any[] }) => {option.description = `[G] ${option.description} [G]`})

      commands.push(cmd)
    });

    (async () => {
      try {
        await rest.put(
          Routes.applicationGuildCommands(process.env.Client as string, guildID),
          { body: commands },
        )
        deployLog("Deploy", `Registered ${commandFiles.length} guild[${guildID}] commands.`)
      }
      catch (err) {console.error(err)}
    })()
  })
}
