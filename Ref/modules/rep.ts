import { CommandInteraction, InteractionReplyOptions, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js"

export default async (interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, object: InteractionReplyOptions) => {
  try {
    interaction.replied || interaction.deferred
      ? await interaction.followUp(object)
      : await interaction.reply(object)
  } catch (err) {
    console.error(`Can't respond to the interaction\n\`\`\`${(err as Error).stack}\`\`\``)
  }
}