import emojis from "./emojis"
import perms from "./permissions"
import { nordChalk } from "./colors"
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js"

export default async (interaction: ChatInputCommandInteraction, ...permissions: bigint[]) => {
  if (!interaction.guild) {
    await interaction.reply({ content: `${emojis.error.shorthand} This command can only be used in a server`, ephemeral: true })
    return true
  }

  let block = false
  let consoleLog = `${nordChalk.yellow("Permissions")} [`
  let repContent = `Permissions needed to use the \`${interaction.commandName}/${interaction.options.getSubcommandGroup() || "_"}/${interaction.options.getSubcommand() || "_"}\` command:`
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