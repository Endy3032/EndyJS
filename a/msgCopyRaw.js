const { superEscape } = require("../modules")
const { ApplicationCommandType } = require("discord.js")

module.exports = {
  cmd: {
    name: "Copy Raw Content",
    description: "",
    type: ApplicationCommandType.Message
  },

  async ctxMenu(interaction) {
    attachments = interaction.targetMessage.attachments.map(attachment => attachment.url)
    msg_content = superEscape(interaction.targetMessage.content)
    msg_content.length == 0 ? content = "**Content**\nNone" : content = `**Content**\n${msg_content}`
    content += `\n\n**Attachment(s): ${attachments.length}**\n<${attachments.join("\n")}>`
    await interaction.reply({ content: `${content}`, ephemeral: true })
  }
}
