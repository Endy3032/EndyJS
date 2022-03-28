import os from "os"
import "dotenv/config"
import stripAnsi from "strip-ansi"
import { APIMessage } from "discord-api-types/v10"
import { emojis, nordChalk, rep } from "../modules"
import { Interaction, BaseGuildTextChannel, ChatInputCommandInteraction, CommandInteraction, Message, MessageComponentInteraction, ModalMessageModalSubmitInteraction, ModalSubmitInteraction } from "discord.js"

interface Command {
  [key: string]: { cmd: object, execute: Function, button?: Function, selectMenu?: Function, ctxMenu?: Function, autocomplete?: Function, modal?: Function }
}

export const name = "interactionCreate"

export async function execute(interaction: Interaction) {
  const isLocal = os.hostname().includes("local")
  const isTestGuild = interaction.guildId == process.env.TestGuild
  const isReplitTest = interaction.channelId == process.env.TestChannel
  if ((isLocal && (!isTestGuild || isReplitTest)) || (!isLocal && isTestGuild && !isReplitTest)) return

  const commandName: string | null =
  interaction.isChatInputCommand() || interaction.isAutocomplete() ? interaction.commandName
  : interaction.isButton() || interaction.isSelectMenu() || interaction.isModalSubmit() ? ((interaction as MessageComponentInteraction | ModalMessageModalSubmitInteraction).message as Message).interaction?.commandName as string || ((interaction as MessageComponentInteraction | ModalMessageModalSubmitInteraction).message as APIMessage).interaction?.name as string //(interaction as MessageComponentInteraction).message?.(interaction as MessageInteraction).commandName || (interaction as MessageComponentInteraction).message?.interaction?.name
  : interaction.isContextMenuCommand() ? interaction.commandName.replace("[D] ", "")
  : null

  let subcmd: string | null, group: string | null

  try {
    subcmd = (interaction as ChatInputCommandInteraction).options.getSubcommand() || null
    group = (interaction as ChatInputCommandInteraction).options.getSubcommandGroup() || null
  } catch {
    subcmd = null
    group = null
  }

  if (!interaction.isAutocomplete()) {
    const author = nordChalk.bright.cyan(`[${interaction.user.tag} | ${`${interaction.guild?.name}#${(interaction.channel as BaseGuildTextChannel).name}` || "DM"}] `)

    const intLog =
    interaction.isChatInputCommand() && group ? `Triggered ${nordChalk.bright.cyan(`[${commandName}/${group}/${subcmd}]`)}`
    : interaction.isChatInputCommand() && subcmd ? `Triggered ${nordChalk.bright.cyan(`[${commandName}/${subcmd}]`)}`
    : interaction.isChatInputCommand() || interaction.isContextMenuCommand() ? `Triggered ${nordChalk.bright.cyan(`[${commandName}]`)}`
    : interaction.isButton() ? `Pushed ${nordChalk.bright.cyan(`[${commandName}/${interaction.customId}]`)}`
    : interaction.isSelectMenu() ? `Selected ${nordChalk.bright.cyan(`[${commandName}/[${interaction.values.join("|")}]]`)}`
    : interaction.isModalSubmit() ? `Submitted ${nordChalk.bright.cyan(`[${commandName}/${interaction.customId}]`)}`
    : "Unknown Interaction"

    const discordTimestamp = Math.floor(interaction.createdTimestamp / 1000)
    const embed = {
      description: stripAnsi(`**Epoch** • ${discordTimestamp}\n**Interaction** • ${intLog}`),
      author: { name: interaction.user.tag, icon_url: interaction.user.avatarURL() },
      footer: { text: `${interaction.guild?.name} #${(interaction.channel as BaseGuildTextChannel).name}` || "**DM**", icon_url: interaction.guild?.iconURL() || null },
      timestamp: new Date(interaction.createdTimestamp).toISOString()
    }

    console.botLog(author + intLog, "INFO", embed)
  }

  const command = interaction.client.commands.get(commandName as never) as unknown as Command

  const handleError = (err: Error, type: string) => {
    try {rep((interaction as CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction), { content: `${emojis.error.shorthand} This interaction failed [${type} Error]`, ephemeral: true })}
    catch {rep((interaction as CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction), { content: `${emojis.error.shorthand} This interaction failed [Unknown Error]`, ephemeral: true })}
    console.botLog(nordChalk.error(err.stack), "ERROR")
  }

  var type: string
  let exec: any
  if (interaction.isChatInputCommand()) {
    exec = command.execute
    type = "Command"
  } else if (interaction.isButton()) {
    exec = command.button
    type = "Button"
  } else if (interaction.isSelectMenu()) {
    exec = command.selectMenu
    type = "Select"
  } else if (interaction.isContextMenuCommand()) {
    exec = command.ctxMenu
    type = "CtxMenu"
  } else if (interaction.isAutocomplete()) {
    exec = command.autocomplete
    type = "Autocomplete"
  } else if (interaction.isModalSubmit()) {
    exec = command.modal
    type = "Modal"
  }
  await exec(interaction)
    .catch((err: any) => {
      console.botLog(nordChalk.error(err.stack), "ERROR")
      return rep ((interaction as CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction), { content: `${emojis.error.shorthand} This interaction failed [${type} Error]`, ephemeral: true })
    })

  process.once("uncaughtException", handleError)
  process.once("unhandledRejection", handleError)
}