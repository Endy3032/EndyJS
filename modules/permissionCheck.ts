import emojis from "./emojis"
import perms from "./permissions"
import { nordChalk } from "./colors"
import { Bot, Interaction, InteractionResponseTypes, sendInteractionResponse } from "discordeno"
import { InteractionOptions } from "../Structures/Interaction"
// import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js"

export default async (client: Bot, interaction: Interaction, ...permissions: bigint[]) => {
  if (!interaction.guildId) {
    await sendInteractionResponse(client, interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content: `${emojis.error.shorthand} This command can only be used in a server`, flags: MsgFlags.Ephemeral }
    })
    return true
  }

  const options = new InteractionOptions(client, interaction)

  let block = false
  let consoleLog = `${nordChalk.yellow("Permissions")} [`
  let repContent = `Permissions needed to use the \`${interaction.data?.name}/${options.getSubcommandGroup() || "_"}/${options.getSubcommand() || "_"}\` command:`
  permissions.forEach(permission => {
    const permName = perms[permission.toString()]
    const hasPerm = (interaction.member?.permissions as PermissionsBitField).has(permission)
    if (!hasPerm) block = true

    consoleLog += ` ${hasPerm ? nordChalk.green(permName) : nordChalk.red(permName)},`
    repContent += `\n${hasPerm ? emojis.success.shorthand : emojis.error.shorthand} \`${permName}\``
  })

  if (block) {
    console.botLog(`${consoleLog.slice(0, -1)} ]`, "WARN")
    await interaction.reply({ content: repContent, ephemeral: true })
  }
  return block
}