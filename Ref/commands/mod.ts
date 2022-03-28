import { emojis, permissionCheck } from "../modules"
import { ApplicationCommandOptionType, ButtonInteraction, ButtonStyle, CategoryChannel, ChannelType, ChatInputCommandInteraction, ComponentType, GuildChannel, GuildChannelCreateOptions, GuildTextBasedChannel, PermissionFlagsBits, TextChannel, VoiceChannel } from "discord.js"

export const cmd = {
  name: "mod",
  description: "Useful commands for moderators",
  options: [
    {
      name: "create",
      description: "Create something in the server",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "text",
          description: "Create a text channel",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "name",
              description: "The channel's name [String 1~100 char]",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "topic",
              description: "The channel's topic [String 0~1024 char]",
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: "below",
              description: "Put below this channel (Default Top) [Text/Category]",
              type: ApplicationCommandOptionType.Channel,
              channel_types: [ChannelType.GuildText, ChannelType.GuildCategory],
              required: false,
            },
            {
              name: "slowmode",
              description: "The channel's slowmode cooldown (Text only) [Integer 0~21600]",
              type: ApplicationCommandOptionType.Integer,
              "min_value": 0,
              "max_value": 21600,
              required: false,
            },
            {
              name: "restricted",
              description: "The channel's NSFW restriction (Default False) [Boolean]",
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
            {
              name: "reason",
              description: "The channel's creation reason [String 0~512 char]",
              type: ApplicationCommandOptionType.String,
              required: false,
            }
          ]
        },
        {
          name: "category",
          description: "Create a category",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "name",
              description: "The category's name [String 1~100 char]",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "below",
              description: "Put below this category (Default Top) [Category]",
              type: ApplicationCommandOptionType.Channel,
              channel_types: [ChannelType.GuildCategory],
              required: false,
            },
            {
              name: "reason",
              description: "The category's creation reason [String 0~512 char]",
              type: ApplicationCommandOptionType.String,
              required: false,
            }
          ]
        },
        {
          name: "voice",
          description: "Create a voice channel",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "name",
              description: "The channel's name [String 1~100 char]",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
            {
              name: "type",
              description: "The channel's type (Default Text)",
              type: ApplicationCommandOptionType.Integer,
              choices: [
                { name: "Voice", value: ChannelType.GuildVoice },
                { name: "Stage", value: ChannelType.GuildStageVoice },
              ],
              required: false,
            },
            {
              name: "below",
              description: "Put below this channel (Default Top) [Voice/Category]",
              type: ApplicationCommandOptionType.Channel,
              channel_types: [ChannelType.GuildVoice, ChannelType.GuildText],
              required: false,
            },
            {
              name: "bitrate",
              description: "The channel's bitrate (Voice only) [Integer]",
              type: ApplicationCommandOptionType.Integer,
              "min_value": 0,
              "max_value": 384,
              required: false,
            },
            {
              name: "user-limit",
              description: "The channel's user limit (Voice only) [Integer]",
              type: ApplicationCommandOptionType.Integer,
              "min_value": 0,
              "max_value": 99,
              required: false,
            },
            {
              name: "reason",
              description: "The channel's creation reason [String 0~512 char]",
              type: ApplicationCommandOptionType.String,
              required: false,
            }
          ]
        },
      ]
    },
    {
      name: "delete",
      description: "Delete something in the server",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "channel",
          description: "Delete a channel",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "The channel to delete [Channel]",
              type: ApplicationCommandOptionType.Channel,
              channel_types: [ChannelType.GuildText, ChannelType.GuildCategory, ChannelType.GuildVoice],
              required: true,
            },
            {
              name: "reason",
              description: "Reason for deleting the channel [String 0~512 char]",
              type: ApplicationCommandOptionType.String,
              required: false,
            }
          ]
        }
      ]
    },
    {
      name: "purge",
      description: "Purge messages",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "amount",
          description: "Amount of messages to purge [Integer 1~100]",
          type: ApplicationCommandOptionType.Integer,
          min_value: 1,
          max_value: 100,
          required: true,
        },
        {
          name: "option",
          description: "Option to filter messages",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "Bots Only", value: "bots" },
            { name: "Users Only", value: "users" },
            // { name: "Texts Only", value: "texts" },
            // { name: "Mentions Only", value: "mentions" },
            // { name: "Links Only", value: "links" },
            // { name: "Embeds Only", value: "embeds" },
            // { name: "Attachments Only", value: "attachments" },
          ],
          required: false,
        },
        {
          name: "user",
          description: "Specific user to purge messages",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ]
    }
  ]
}

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return await interaction.reply({ content: `${emojis.error.shorthand} This command can only be used in a server`, ephemeral: true })

  switch (interaction.options.getSubcommandGroup()) {
    case "create": {
      if (await permissionCheck(interaction, PermissionFlagsBits.ManageChannels)) return
      const channelName = interaction.options.getString("name") as string
      let options: GuildChannelCreateOptions | undefined
      let parentID: string | null
      let position: number | null | any

      switch (interaction.options.getSubcommand()) {
        case "text": {
          const topic = interaction.options.getString("topic") || undefined
          const slowmode = interaction.options.getInteger("slowmode") || 0
          const below = interaction.options.getChannel("below") as TextChannel | CategoryChannel
          const nsfw = interaction.options.getBoolean("nsfw") || false
          const reason = interaction.options.getString("reason") || `Created by ${interaction.user.tag}`

          if (below.isCategory()) {
            parentID = below.id
            try {position = below.children.cache.map(child => child.isText() && child.rawPosition).reduce((prev, curr) => {return (curr < prev ? curr : prev)})}
            catch {position = 0}
          } else if (below?.isText()) {
            parentID = below.parentId
            position = below.rawPosition + 1
          } else {
            parentID = null
            position = null
          }

          options = { type: ChannelType.GuildText, topic: topic, rateLimitPerUser: slowmode, parent: parentID as string | undefined, nsfw: nsfw, reason: reason }
          break
        }

        case "category": {
          const below = interaction.options.getChannel("below") as CategoryChannel
          const reason = interaction.options.getString("reason") || `Created by ${interaction.user.tag}`
          position = below.rawPosition + 1

          options = { type: ChannelType.GuildCategory, position: position as number | undefined, reason: reason }
          break
        }

        case "voice": {
          const type = interaction.options.getInteger("type") || ChannelType.GuildVoice
          const below = interaction.options.getChannel("below") as VoiceChannel | CategoryChannel
          const bitrate = (interaction.options.getInteger("bitrate") as number) * 1000 || 64000
          const userLimit = interaction.options.getInteger("user-limit") || 0
          const reason = interaction.options.getString("reason") || `Created by ${interaction.user.tag}`

          if (below?.isCategory()) {
            parentID = below.id
            try {position = below.children.cache.map(child => child.isVoice() && child.rawPosition).reduce((prev, curr) => {return (curr < prev ? curr : prev)})}
            catch {position = 0}
          } else if (below?.isVoice()) {
            parentID = below.parentId
            position = below.rawPosition + 1
          } else {
            parentID = position = null
          }

          options = { type: type, bitrate: bitrate, userLimit: userLimit, parent: parentID as string | undefined, reason: reason }
          break
        }
      }

      await interaction.guild.channels.create(channelName, options)
        .then(channel => {channel.setPosition(position as number); interaction.reply({ content: `${emojis.success.shorthand} Created ${interaction.options.getSubcommand()} channel <#${channel.id}>`, ephemeral: true })})
        .catch(err => {
          if (String(err).toString().includes("50024")) {
            (options as GuildChannelCreateOptions).type = ChannelType.GuildVoice
            interaction.guild?.channels.create(channelName, options)
              .then(channel => {channel.setPosition(position as number); interaction.reply({ content: `${emojis.warn.shorthand} This server can't create Stage channels yet, fallback to voice channel instead <#${channel.id}>`, ephemeral: true })})
          }
          else {interaction.reply({ content: `${emojis.error.shorthand} Something went wrong while creating ${channelName}\n\`\`\`${err}\`\`\``, ephemeral: true }); console.botLog(err.stack, "ERROR")}
        })

      break
    }

    case "delete": {
      if (await permissionCheck(interaction, PermissionFlagsBits.ManageChannels)) return

      switch (interaction.options.getSubcommand()) {
        case "channel": {
          const channel = interaction.options.getChannel("channel") as GuildChannel
          const reason = interaction.options.getString("reason") || `Deleted by ${interaction.user.tag}`
          interaction.reply({ content: `${emojis.trash.shorthand} Do you want to delete #${channel.name}${reason != `Deleted by ${interaction.user.tag}` ? ` with the reason \`${reason}\`` : ""}?`, components: [{
            type: ComponentType.ActionRow,
            components: [{
              type: ComponentType.Button,
              style: ButtonStyle.Danger,
              label: "Confirm",
              emoji: { name: emojis.trash.name, id: emojis.trash.id },
              custom_id: `delete_${channel.id}`
            }]
          }], ephemeral: true })
          break
        }
      }
      break
    }

    default: {
      switch (interaction.options.getSubcommand()) {
        case "purge": {
          if (await permissionCheck(interaction, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageGuild)) return

          const amount = interaction.options.getInteger("amount") as number
          const option = interaction.options.getString("option")
          const user = interaction.options.getUser("user")
          let content = `Press \`Confirm\` to delete \`${amount > 100 ? 100 : amount}\` messages.`
          if (option && user) {
            content += `\n**Option & User:** ${option}, ${user}`
          } else {
            content += option ? `\n**Option:** ${option}` : user ? `\n**User:** ${user}` : ""
          }

          interaction.reply({ content: content, components: [{
            type: ComponentType.ActionRow,
            components: [{
              type: ComponentType.Button,
              style: ButtonStyle.Danger,
              label: "Confirm",
              emoji: { name: emojis.trash.name,
                id: emojis.trash.id
              },
              custom_id: `purge_${amount <= 100 ? amount : 100}_${option || "none"}_${user?.id || "none"}`
            }]
          }], ephemeral: true })
          break
        }
      }
      break
    }
  }
}

export async function button(interaction: ButtonInteraction) {
  const customID = interaction.customId
  const [commandName, samount, option, user] = customID.split("_")
  const amount = parseInt(samount)
  await interaction.deferUpdate()
  switch (commandName) {
    case "delete": {
      const { [1]: reason } = interaction.message.content.split("`")
      const channel = interaction.client.channels.cache.get(interaction.customId.slice(7)) as GuildChannel
      if (channel == undefined) {return await interaction.followUp({ content: "This channel has been deleted already. Feel free to discard both messages.", ephemeral: true })}

      await channel.delete(reason)
        .then(async() => {await interaction.followUp({ content: `${emojis.success.shorthand} Deleted #${channel.name}`, ephemeral: true })})
        .catch((err: Error) => {interaction.followUp({ content: `${emojis.error.shorthand} Failed to delete ${channel.name}\n\`\`\`${err}\`\`\``, ephemeral: true }); console.botLog(err.stack, "ERROR")})
      break
    }

    case "purge": {
      if (option == "none" && user == "none") {
        await (interaction.channel as GuildTextBasedChannel).bulkDelete(amount, true)
          .then(() => {console.botLog(`Purged ${amount} messages`)})
          .catch((err: Error) => {interaction.followUp({ content: `${emojis.error.shorthand} Something went wrong while purging the channel\n\`\`\`${err}\`\`\``, ephemeral: true }); console.botLog(err.stack, "ERROR")})
      } else {
        const messages = await (interaction.channel as GuildTextBasedChannel).messages.fetch({ limit: amount })
        const clearList = messages.filter(message => {
          let cri1 = false, cri2 = false, cri3 = false

          if (option == "bots") cri1 = message.author.bot
          if (option == "users") cri2 = !message.author.bot
          if (user != "none") cri3 = (message.author.id == user)
          return cri1 || cri2 || cri3
        })

        await (interaction.channel as GuildTextBasedChannel).bulkDelete(clearList, true)
          .then(() => {const content = `${emojis.success.shorthand} Found and purged ${clearList.size}/${amount} messages`; interaction.followUp({ content: content, ephemeral: true }); console.botLog(content)})
          .catch((err: Error) => {interaction.followUp({ content: `${emojis.error.shorthand} Something went wrong while purging the channel\n\`\`\`${err}\`\`\``, ephemeral: true }); console.botLog(err.stack, "ERROR")})
      }
      break
    }
  }
}
