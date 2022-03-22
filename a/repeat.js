const { ApplicationCommandOptionType } = require("discord.js")

module.exports = {
  cmd: {
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
  },

  async execute(interaction) {
    function repeat(msg, x) {
      setTimeout(function() {interaction.channel.send(msg)}, 750 * x)
    }

    const message = interaction.options.getString("message")
    var times = interaction.options.getInteger("times") || 3

    // Failsafe
    times > 10 ? (times = 10, response += "\nNote: 10 times maximum") : times
    response = `Dispatching "${message}" ${times} times`

    if (interaction.guild) {
      await interaction.reply({ content: response, ephemeral: true })
      for (let i = 0; i < times; i++) {repeat(message, i)}
    } else {
      await interaction.reply("This command can only be used in server channels.")
    }
  },
}
