const fs = require("fs")
const misc = require("../other/misc.js")
const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageActionRow, MessageEmbed, MessageSelectMenu } = require('discord.js')

const colors = misc.colors
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && !file.startsWith('help'))
var names = ['help']
var descs = ['Show the list of all available commands']
var args = ['none']
var usage = ['`/help`']

commandFiles.forEach(f => {
  let props = require(`./${f}`)
  names.push(props.help.name)
  descs.push(props.help.description)
  args.push(props.help.usage)
  usage.push(props.help.usage)
})

options = []
names.forEach((x, i) => {
  option = {
    label: x,
    description: descs[i],
    value: x + '_opt'
  }

  options.push(option)
})

const menu = new MessageActionRow()
  .addComponents(
    new MessageSelectMenu()
      .setCustomId('help_menu')
      .setPlaceholder('Select a command')
      .addOptions(options)
  )

module.exports = {
  data: new SlashCommandBuilder()
  .setName('help')
  .setDescription(descs[0]),
  
  async execute(interaction) {
    const help_main = new MessageEmbed()
      .setColor(`#${colors[Math.floor(Math.random() * colors.length)]}`)
      .setTitle('Help')
      .setAuthor(`${interaction.user.username}#${interaction.user.discriminator}`, `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`)
      .setDescription('`[arguments]` are optional arguments\n`<arguments>` are required arguments')
      .addFields({ name: 'Navigate the help menu', value: 'Use the dropdown menu to navigate the help menu!' })
      .setTimestamp()
      .setFooter(`${interaction.client.user.username}#${interaction.client.user.discriminator}`, `https://cdn.discordapp.com/avatars/${interaction.client.user.id}/${interaction.client.user.avatar}.png`)
      
    await interaction.reply({ embeds: [help_main], components: [menu] })
  },
  
  async menu(interaction) {
    index = names.indexOf(interaction.values[0].slice(0, -4))
    
    const help = new MessageEmbed()
    .setColor(`#${colors[Math.floor(Math.random() * colors.length)]}`)
    .setTitle('Help - ' + names[index])
    .setAuthor(`${interaction.user.username}#${interaction.user.discriminator}`, `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`)
    .setDescription('`[arguments]` are optional arguments\n`<arguments>` are required arguments')
    .addFields({ name: 'Name', value: names[index] })
    .addFields({ name: 'Description', value: descs[index] })
    .addFields({ name: 'Arguments', value: args[index] })
    .addFields({ name: 'Usage', value: usage[index] })
    .setTimestamp()
    .setFooter(`${interaction.client.user.username}#${interaction.client.user.discriminator}`, `https://cdn.discordapp.com/avatars/${interaction.client.user.id}/${interaction.client.user.avatar}.png`)
    
    await interaction.update({ embeds: [help], components: [menu] })
  }
}

// module.exports.commandList = {
//   names: names,
//   descs: descs,
//   args: args,
//   usage: usage,
//   options: options
// }