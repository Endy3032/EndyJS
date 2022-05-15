import { rgb24, stripColor } from "colors"
import { imageURL, BrightNord, getSubcmd, getSubcmdGroup, toTimestamp } from "Modules"
import { Bot, EventHandlers, Interaction, InteractionTypes, MessageComponentTypes, getGuild, getChannel, Embed } from "discordeno"

const testGuildID = Deno.env.get("TestGuild")
const testGuildChannel = Deno.env.get("TestChannel")
if (testGuildID === undefined) throw new Error("Test Guild Not Defined")
if (testGuildChannel === undefined) throw new Error("Test Guild Channel Not Defined")

export const name: keyof EventHandlers = "interactionCreate"
export const execute = async (bot: Bot, interaction: Interaction) => {
  const isLocal = Deno.build.os == "darwin"
  const isTestGuild = interaction.guildId == BigInt(testGuildID)
  const isReplitTest = interaction.channelId == BigInt(testGuildChannel)
  if ((isLocal && (!isTestGuild || isReplitTest)) || (!isLocal && isTestGuild && !isReplitTest)) return

  const commandName =
  [InteractionTypes.ApplicationCommand, InteractionTypes.ApplicationCommandAutocomplete].includes(interaction.type)
    ? interaction.data?.name.replace(/^(\[.\]) /, "")
    : [InteractionTypes.MessageComponent, InteractionTypes.ModalSubmit].includes(interaction.type)
      ? interaction.message?.interaction?.name
      : "null"

  getSubcmd(interaction)

  const [subcmd, group] = [getSubcmd(interaction), getSubcmdGroup(interaction)]

  if (interaction.type != InteractionTypes.ApplicationCommandAutocomplete) {
    const guild = interaction.guildId ? await getGuild(bot, interaction.guildId) : null
    const guildName = guild?.name || null
    const channelName = interaction.channelId ? (await getChannel(bot, BigInt(interaction.channelId))).name : null
    const invoker = rgb24(`[${interaction.user.username}#${interaction.user.discriminator} | ${guildName ? `${guildName} #${channelName}` : "DM"}] `, BrightNord.cyan)

    const interactionLog =
    interaction.type == InteractionTypes.ApplicationCommand && group ? `Triggered ${rgb24(`[${commandName}/${group}/${subcmd}]`, BrightNord.cyan)}`
    : interaction.type == InteractionTypes.ApplicationCommand && subcmd ? `Triggered ${rgb24(`[${commandName}/${subcmd}]`, BrightNord.cyan)}`
    : interaction.type == InteractionTypes.ApplicationCommand ? `Triggered ${rgb24(`[${commandName}]`, BrightNord.cyan)}`
    : interaction.type == InteractionTypes.MessageComponent && interaction.data?.componentType == MessageComponentTypes.Button ? `Pushed ${rgb24(`[${commandName}/${interaction.data.customId}]`, BrightNord.cyan)}`
    : interaction.type == InteractionTypes.MessageComponent && interaction.data?.componentType == MessageComponentTypes.SelectMenu ? `Selected ${rgb24(`[${commandName}/[${interaction.data?.values?.join("|")}]]`, BrightNord.cyan)}`
    : interaction.type == InteractionTypes.ModalSubmit ? `Submitted ${rgb24(`[${commandName}/${interaction.data?.customId}]`, BrightNord.cyan)}`
    : "Unknown Interaction"

    const discordTimestamp = toTimestamp(interaction.id)

    const embed: Embed = {
      description: stripColor(`**Timestamp** • ${discordTimestamp}\n**Interaction** • ${interactionLog}`),
      author: { name: `${interaction.user.username}#${interaction.user.discriminator}`, iconUrl: imageURL(interaction.user.id, interaction.user.avatar, "avatars") || undefined },
      footer: { text: guildName ? `${guildName} #${channelName}` : "**DM**", iconUrl: imageURL(guild?.id, guild?.icon, "icons") || undefined },
      timestamp: Number(discordTimestamp)
    }

    console.botLog(invoker + interactionLog, "INFO", embed)
  }

  // const command = interaction.client.commands.get(commandName as never) as unknown as Command

  // const [exec, type] =
  // interaction.type == InteractionTypes.ApplicationCommand
  //   ? [command.execute, "Command"]
  //   : interaction.type == InteractionTypes.MessageComponent && interaction.data?.componentType == MessageComponentTypes.Button
  //     ? [command.button,  "Button"]
  //     : interaction.type == InteractionTypes.MessageComponent && interaction.data?.componentType == MessageComponentTypes.SelectMenu
  //       ? [command.select,  "Select Menu"]
  //       : interaction.type == InteractionTypes.ModalSubmit
  //         ? [command.modal,   "Modal"]
  //         : interaction.type == InteractionTypes.ApplicationCommandAutocomplete
  //           ? [command.autocomplete, "Autocomplete"]
  //           : [console.log, "Unknown"]

  // await exec(interaction).catch((err: Error) => {return handleError(interaction, err, type)})

  // console.log(getSubcmd(interaction, ))
  // switch (interaction.data?.componentType) {
  //   case MessageComponentTypes.Button: {
  //     commandName = "button"
  //     break
  //   }

  //   case MessageComponentTypes.SelectMenu: {
  //     commandName = "select"
  //     break
  //   }
  // }
}