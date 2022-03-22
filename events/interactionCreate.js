import { hostname } from "os"
import "dotenv/config"
// require("dotenv").config()
import stripAnsi from "strip-ansi"
import { emojis, nordChalk, rep } from "../modules/index.js"

export const name = "interactionCreate"
export async function execute(interaction) {
  isLocal = hostname().includes("local")
  isTestGuild = interaction.guildId == process.env.TestGuild
  isReplitTest = interaction.channelId == process.env.TestChannel
  if ((isLocal && (!isTestGuild || isReplitTest)) || (!isLocal && isTestGuild && !isReplitTest))
    return

  commandName =
    interaction.isChatInputCommand() || interaction.isAutocomplete() ? interaction.commandName
      : interaction.isButton() || interaction.isSelectMenu() || interaction.isModalSubmit() ? interaction.message.interaction.commandName || interaction.message.interaction.name
        : interaction.isContextMenuCommand() ? interaction.commandName.replace("[D] ", "")
          : null

  if (!interaction.isAutocomplete()) {
    author = nordChalk.bright.cyan(`[${interaction.user.tag} | ${interaction.guildId ? `${interaction.guild.name}#${interaction.channel.name}` : "DM"}] `)

    intLog =
      interaction.isChatInputCommand() && interaction.options._group ? `Triggered ${nordChalk.bright.cyan(`[${commandName}/${interaction.options._group}/${interaction.options._subcommand}]`)}`
        : interaction.isChatInputCommand() && interaction.options._subcommand ? `Triggered ${nordChalk.bright.cyan(`[${commandName}/${interaction.options._subcommand}]`)}`
          : interaction.isChatInputCommand() || interaction.isContextMenuCommand() ? `Triggered ${nordChalk.bright.cyan(`[${commandName}]`)}`
            : interaction.isButton() ? `Pushed ${nordChalk.bright.cyan(`[${commandName}/${interaction.customId}]`)}`
              : interaction.isSelectMenu() ? `Selected ${nordChalk.bright.cyan(`[${commandName}/[${interaction.values.join("|")}]]`)}`
                : interaction.isModalSubmit() ? `Submitted ${nordChalk.bright.cyan(`[${commandName}/${interaction.customId}]`)}`
                  : "Unknown Interaction"

    discordTimestamp = Math.floor(interaction.createdTimestamp / 1000)
    embed = {
      description: stripAnsi(`**Epoch** • ${discordTimestamp}\n**Interaction** • ${intLog}`),
      author: { name: interaction.user.tag, icon_url: interaction.user.avatarURL() },
      footer: { text: interaction.guild ? `${interaction.guild.name} #${interaction.channel.name}` : "**DM**", icon_url: interaction.guild.iconURL() },
      timestamp: new Date(interaction.createdTimestamp).toISOString()
    }

    console.botLog(author + intLog, "INFO", embed)
  }

  const command = interaction.client.commands.get(commandName)

  handleError = (err) => {
    try { rep(interaction, { content: `${emojis.error.shorthand} This interaction failed [${type} Error]`, ephemeral: true })} 
    catch { rep(interaction, { content: `${emojis.error.shorthand} This interaction failed [Unknown Error]`, ephemeral: true })} 
    console.botLog(nordChalk.error(err.stack), "ERROR")
  }

  try {
    if (interaction.isChatInputCommand()) {
      execute = command.execute
      type = "Command"
    } else if (interaction.isButton()) {
      execute = command.button
      type = "Button"
    } else if (interaction.isSelectMenu()) {
      execute = command.selectMenu
      type = "Select"
    } else if (interaction.isContextMenuCommand()) {
      execute = command.ctxMenu
      type = "CtxMenu"
    } else if (interaction.isAutocomplete()) {
      execute = command.autocomplete
      type = "Autocomplete"
    } else if (interaction.isModalSubmit()) {
      execute = command.modal
      type = "Modal"
    }
  } catch (err) {
    console.botLog(nordChalk.error(err.stack), "ERROR")
    return await interaction.reply({ content: `${emojis.error.shorthand} This interaction failed [Unknown Error]`, ephemeral: true })
  }

  try { await execute(interaction)} 
  catch (err) { return handleError(err)} 

  process.once("uncaughtException", handleError)
  process.once("unhandledRejection", handleError)
}