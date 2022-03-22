// const { emojis, nordChalk } = require("./index")
import emojis from "./emojis"
import { nordChalk } from "./colors"
import perms from "./permissions"

export default async (interaction, ...permissions) => {
  if (!interaction.guild) {
    await interaction.reply({ content: `${emojis.error.shorthand} This command can only be used in a server`, ephemeral: true })
    return true
  }

  block = false
  consoleLog = `${nordChalk.yellow("Permissions")} [`
  repContent = `Permissions needed to use the \`${interaction.commandName}${(gr = interaction.options._group) != null ? `/${gr}` : ""}${(sc = interaction.options._subcommand) != null ? `/${sc}` : ""}\` command:`
  permissions.forEach(permission => {
    permName = perms[permission]
    hasPerm = interaction.member.permissions.has(permission)
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