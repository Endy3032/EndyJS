const { Client, Intents, Constants } = require('discord.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
});

client.once('ready', () => {
	console.log('Ready!');

  client.user.setPresence(
    {
      activities: [{ name: '🌧agoraphobic🌧', type: 2 }],
      status: 'idle'
    }
  );

  const guild = client.guilds.cache.get('554684928684589065')
  let commands

  if (guild) {
    commands = guild.commands
  } else {
    commands = client.application?.commands
  }

  commands?.create({
    name: 'ping',
    description: 'Test Ping command'
  })

  commands?.create({
    name: 'add',
    description: 'Add two numbers Test',
    options: [
      {
        name: 'num1',
        description: 'The first number',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.NUMBER
      },
      {
        name: 'num2',
        description: 'The second number',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.NUMBER
      }
    ]
  })
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return
  }

  const { commandName, options } = interaction

  if (commandName === 'ping') {
    interaction.reply({
      content: 'pong',
      ephemeral: false
    })
  } else if (commandName === 'add') {
    const num1 = options.getNumber('num1') || 0
    const num2 = options.getNumber('num2') || 0
    interaction.reply({
      content: `${num1} + ${num2} = ${num1 + num2}`,
      ephemeral: false
    })
  }
})

client.login(process.env.TOKEN)