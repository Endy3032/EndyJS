import { superEscape } from "../modules"
import { ApplicationCommandType, Message, MessageContextMenuCommandInteraction } from "discord.js"

export const cmd = {
  name: "Copy Raw Content",
  description: "",
  type: ApplicationCommandType.Message
}

export async function ctxMenu(interaction: MessageContextMenuCommandInteraction) {
  const msg = interaction.targetMessage as Message
  const attachments = msg.attachments.map(attachment => attachment.url)
  const msg_content = superEscape(msg.content)
  let content = msg_content.length == 0 ? "**Content**\nNone" : `**Content**\n${msg_content}`
  content += `\n\n**Attachment(s): ${attachments.length}**\n<${attachments.join("\n")}>`
  await interaction.reply({ content: `${content}`, ephemeral: true })
}
