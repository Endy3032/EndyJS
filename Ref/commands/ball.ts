import { colors, random } from "../modules"
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js"

export const cmd = {
  name: "8ball",
  description: "Get a response from the magic 8-Ball",
  options: [
    {
      name: "question",
      description: "The question to ask [string]",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ]
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const responses = {
    yes: [
      "It's certain.",
      "It's decidedly so.",
      "Without a doubt.",
      "Yes, definitely.",
      "You may rely on it.",
      "As i see it, yes.",
      "Most likely.",
      "Outlook good.",
      "Yes.",
      "Signs point to Yes.",
    ],
    neutral: [
      "Reply hazy, try again.",
      "Ask again later.",
      "Better not tell you now.",
      "Can't predict now",
      "Concentrate and ask again",
    ],
    no: [
      "Don't count on it.",
      "My reply is no.",
      "My sources say no.",
      "Outlook not so good.",
      "Very doubtful",
    ]
  }

  const index = Math.floor(Math.random() * 300) % 3
  const question = interaction.options.getString("question") as string
  const response = question.endsWith("\u200a") || question.startsWith("\u200a") ? random.pickFromArray(responses.yes)
    : question.endsWith("\u200b") || question.startsWith("\u200b") ? random.pickFromArray(responses.no)
    : random.pickFromArray(responses[Object.keys(responses)[index]])

  await interaction.reply({ embeds: [{
    title: "Magic 8-Ball",
    color: parseInt(random.pickFromArray(colors), 16),
    fields: [
      { name: ":question: Question", value: question, inline: false },
      { name: ":8ball: Response", value: response, inline: false }
    ]
  }] })
}
