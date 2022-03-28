import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js"

export const cmd = {
  name: "repeat",
  description: "Repeat something",
  options: [
    {
      name: "message",
      description: "The message to repeat [string]",
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "times",
      description: "The number of times to repeat the message [integer 1~5, default 3]",
      type: ApplicationCommandOptionType.Integer,
      "min_value": 1,
      "max_value": 5,
      required: false
    }
  ]
}

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return await interaction.reply("This command can only be used in server channels.")

  function repeat(msg: string, x: number) {
    setTimeout(function() {interaction.channel?.send(msg)}, 750 * x)
  }

  const message = interaction.options.getString("message") as string
  var times = interaction.options.getInteger("times") || 3

  // Failsafe
  let response = `Dispatching "${message}" ${times} times`
  times > 10 ? (times = 10, response += "\nNote: 10 times maximum") : times

  await interaction.reply({ content: response, ephemeral: true })
  for (let i = 0; i < times; i++) {repeat(message, i)}
}
