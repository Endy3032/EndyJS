import { ApplicationCommandType, MessageContextMenuCommandInteraction } from "discord.js"

export const cmd = {
  name: "Delete DM message",
  description: "",
  type: ApplicationCommandType.Message
}

export async function ctxMenu(interaction: MessageContextMenuCommandInteraction) {
  if (interaction.guild) return await interaction.reply({ content: "This command is supposed to be used in a DM.", ephemeral: true })
  if (interaction.client.user?.id != interaction.targetMessage.author.id) return await interaction.reply({ content: "This command can only be used on a message sent from me.", ephemeral: true })
  const { id } = interaction.targetMessage
  const channel = await interaction.user.createDM()
  const msg = await channel.messages.fetch(id)
  await msg.delete()
  await interaction.reply({ content: "Deleted the message!", ephemeral: true })
}
