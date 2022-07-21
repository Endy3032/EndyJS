import { Bot, EditWebhookMessage, Interaction, InteractionApplicationCommandCallbackData, InteractionResponseTypes, InteractionTypes } from "discordeno"
import { emojis } from "./emojis.ts"
import { MessageFlags } from "./types.ts"

export async function respond(bot: Bot, interaction: Interaction, response: InteractionApplicationCommandCallbackData | string, ephemeral = false) {
  let type = InteractionResponseTypes.ChannelMessageWithSource
  const data = typeof response === "string" ? { content: response } : response

  if (typeof response != "string") {
    type = response.title
      ? InteractionResponseTypes.Modal
      : interaction.type == InteractionTypes.ApplicationCommandAutocomplete && response.choices
      ? InteractionResponseTypes.ApplicationCommandAutocompleteResult
      : InteractionResponseTypes.ChannelMessageWithSource
  }

  if (ephemeral) data.flags = MessageFlags.Ephemeral

  return bot.helpers.sendInteractionResponse(interaction.id, interaction.token, { type, data }).catch(err => console.botLog(err, "ERROR"))
}

export async function edit(bot: Bot, interaction: Interaction, response: EditWebhookMessage | InteractionApplicationCommandCallbackData | string) {
  if (interaction.type == InteractionTypes.ApplicationCommandAutocomplete) return
  bot.helpers.editInteractionResponse(interaction.token, typeof response === "string" ? { content: response } : response)
    .catch(err => console.botLog(err, "ERROR"))
}

export async function defer(bot: Bot, interaction: Interaction, ephemeral = false) {
  if (interaction.type == InteractionTypes.ApplicationCommandAutocomplete) throw new Error("Cannot defer an autocomplete interaction.")

  const responseType = [InteractionTypes.ApplicationCommand, InteractionTypes.ModalSubmit].includes(interaction.type)
    ? InteractionResponseTypes.DeferredChannelMessageWithSource
    : InteractionResponseTypes.DeferredUpdateMessage

  return bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
    type: responseType,
    data: { flags: ephemeral ? MessageFlags.Ephemeral : undefined },
  }).catch(err => console.botLog(err, "ERROR"))
}

export async function error(bot: Bot, interaction: Interaction, err: Error, type?: string, isEdit = false) {
  const content = `${emojis.error.shorthand} This interaction failed [${type || "Unknown"}]\`\`\`\n${err.name}: ${err.message}\n\`\`\``
  if (isEdit) await edit(bot, interaction, content)
  else await respond(bot, interaction, content, true)
  console.botLog(err, "ERROR")
}
