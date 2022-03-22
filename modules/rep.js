export default async (interaction, object) => {
  if (interaction.isAutocomplete) return
  try {
    interaction.replied || interaction.deferred
      ? await interaction.followUp(object)
      : await interaction.reply(object)
  } catch (err) {
    console.error(`Can't respond to the interaction - ${err}`)
  }
}