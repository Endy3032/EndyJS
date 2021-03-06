import os from "os"
import "dotenv/config"
import stripAnsi from "strip-ansi"
import { Temporal } from "@js-temporal/polyfill"
import { handleError, nordChalk } from "../Modules"
import { APIEmbed, APIMessage } from "discord-api-types/v10"
import { Interaction, BaseGuildTextChannel, ChatInputCommandInteraction, Message, MessageComponentInteraction, ModalMessageModalSubmitInteraction } from "discord.js"

interface Command {
  [key: string]: { cmd: object, execute: Function, button?: Function, selectMenu?: Function, ctxMenu?: Function, autocomplete?: Function, modal?: Function }
}

export const name = "interactionCreate"

export async function execute(interaction: Interaction) {
  const isLocal = os.hostname().includes("local")
  const isTestGuild = interaction.guildId == process.env.TestGuild
  const isReplitTest = interaction.channelId == process.env.TestChannel
  if ((isLocal && (!isTestGuild || isReplitTest)) || (!isLocal && isTestGuild && !isReplitTest)) return

  process.once("uncaughtException", (err: Error) => handleError(interaction, err, "Uncaught Exception"))
  process.once("unhandledRejection", (err: Error) => handleError(interaction, err, "Unhandled Rejection"))

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
    const author = nordChalk.bright.cyan(`[${interaction.user.tag} | ${interaction.guild ? `${interaction.guild.name}#${(interaction.channel as BaseGuildTextChannel).name}` : "DM"}] `)

    const intLog =
    interaction.isChatInputCommand() && group ? `Triggered ${nordChalk.bright.cyan(`[${commandName}/${group}/${subcmd}]`)}`
    : interaction.isChatInputCommand() && subcmd ? `Triggered ${nordChalk.bright.cyan(`[${commandName}/${subcmd}]`)}`
    : interaction.isChatInputCommand() || interaction.isContextMenuCommand() ? `Triggered ${nordChalk.bright.cyan(`[${commandName}]`)}`
    : interaction.isButton() ? `Pushed ${nordChalk.bright.cyan(`[${commandName}/${interaction.customId}]`)}`
    : interaction.isSelectMenu() ? `Selected ${nordChalk.bright.cyan(`[${commandName}/[${interaction.values.join("|")}]]`)}`
    : interaction.isModalSubmit() ? `Submitted ${nordChalk.bright.cyan(`[${commandName}/${interaction.customId}]`)}`
    : "Unknown Interaction"

    const discordTimestamp = Math.floor(interaction.createdTimestamp / 1000)
    const embed: APIEmbed = {
      description: stripAnsi(`**Epoch** ??? ${discordTimestamp}\n**Interaction** ??? ${intLog}`),
      author: { name: interaction.user.tag, icon_url: interaction.user.avatarURL() || undefined },
      footer: { text: `${interaction.guild?.name} #${(interaction.channel as BaseGuildTextChannel).name}` || "**DM**", icon_url: interaction.guild?.iconURL() || undefined },
      timestamp: Temporal.Instant.fromEpochMilliseconds(interaction.createdTimestamp).toString()
    }

    console.botLog(author + intLog, "INFO", embed)
  }

  const command = interaction.client.commands.get(commandName as never) as unknown as Command

  const [exec, type] = interaction.isChatInputCommand()   ? [command.execute,      "Command"]
    :                  interaction.isContextMenuCommand() ? [command.ctxMenu,      "CtxMenu"]
    :                  interaction.isButton()             ? [command.button,       "Button"]
    :                  interaction.isSelectMenu()         ? [command.selectMenu,   "Select"]
    :                  interaction.isModalSubmit()        ? [command.modal,        "Modal"]
    :                                                       [command.autocomplete, "Autocomplete"] as [any, string]

  await exec(interaction).catch((err: Error) => {return handleError(interaction, err, type)})
}
