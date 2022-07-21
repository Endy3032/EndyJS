import { commands } from "/Commands/mod.ts"
import { rgb24, stripColor } from "colors"
import { Bot, Embed, EventHandlers, Interaction, InteractionTypes, MessageComponentTypes } from "discordeno"
import { BrightNord, Command, emojis, getCmdName, getSubcmd, getSubcmdGroup, imageURL, respond, toTimestamp } from "modules"

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

  const [commandName, subcmd, group] = [getCmdName(interaction), getSubcmd(interaction), getSubcmdGroup(interaction)]

  if (interaction.type != InteractionTypes.ApplicationCommandAutocomplete) {
    const guild = interaction.guildId ? await bot.helpers.getGuild(interaction.guildId) : null
    const guildName = guild?.name ?? null
    const channelName = interaction.channelId ? (await bot.helpers.getChannel(BigInt(interaction.channelId)))?.name : null
    const invoker = rgb24(`[${interaction.user.username}#${interaction.user.discriminator} | ${guildName ? `${guildName} #${channelName}` : "DM"}] `, BrightNord.cyan)

    const interactionLog = interaction.type == InteractionTypes.ApplicationCommand
      ? `Triggered ${rgb24(`/${[commandName, group, subcmd].join(" ").replaceAll("  ", " ")}`, BrightNord.cyan)}`
      : interaction.type == InteractionTypes.MessageComponent && interaction.data?.componentType == MessageComponentTypes.Button
      ? `Pushed ${rgb24(`[${commandName}/${interaction.data.customId}]`, BrightNord.cyan)}`
      : interaction.type == InteractionTypes.MessageComponent && interaction.data?.componentType == MessageComponentTypes.SelectMenu
      ? `Selected ${rgb24(`[${commandName}/[${interaction.data?.values?.join("|")}]]`, BrightNord.cyan)}`
      : interaction.type == InteractionTypes.ModalSubmit
      ? `Submitted ${rgb24(`[${commandName}/${interaction.data?.customId}]`, BrightNord.cyan)}`
      : "Unknown Interaction"

    const discordTimestamp = toTimestamp(interaction.id)

    const embed: Embed = {
      description: stripColor(`**Timestamp** • ${discordTimestamp}\n**Interaction** • ${interactionLog}`),
      author: { name: `${interaction.user.username}#${interaction.user.discriminator}`, iconUrl: imageURL(interaction.user.id, interaction.user.avatar, "avatars") },
      footer: { text: guildName ? `${guildName} #${channelName}` : "**DM**", iconUrl: imageURL(guild?.id, guild?.icon, "icons") },
      timestamp: Number(discordTimestamp),
    }

    console.botLog(invoker + interactionLog, "INFO", embed)
  }

  const command = commands.get(commandName ?? "null") as Command

  const [exec, type] = interaction.type == InteractionTypes.ApplicationCommand
    ? [command?.execute ?? undefined, "Command"]
    : interaction.type == InteractionTypes.MessageComponent && interaction.data?.componentType == MessageComponentTypes.Button
    ? [command?.button ?? undefined, "Button"]
    : interaction.type == InteractionTypes.MessageComponent && interaction.data?.componentType == MessageComponentTypes.SelectMenu
    ? [command?.select ?? undefined, "Select Menu"]
    : interaction.type == InteractionTypes.ModalSubmit
    ? [command?.modal ?? undefined, "Modal"]
    : interaction.type == InteractionTypes.ApplicationCommandAutocomplete
    ? [command?.autocomplete ?? undefined, "Autocomplete"]
    : [console.log, "Unknown"]

  if (exec !== undefined) {
    try {
      await exec(bot, interaction)
    } catch (e) {
      console.botLog(e, "ERROR")
    }
  } else {
    console.botLog(`No ${type} function found for [${commandName}]`, "ERROR")
    await respond(bot, interaction, `${emojis.error.shorthand} Something failed back here...`, true)
  }
}
