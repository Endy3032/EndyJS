import { ApplicationCommandOptionChoice, ApplicationCommandOptionTypes, BitwisePermissionFlags as Permissions, Bot, ButtonStyles, ChannelTypes, CreateApplicationCommand, CreateGuildChannel, Interaction, MessageComponentTypes, ModifyGuildChannelPositions, TextStyles, VoiceRegions } from "discordeno"
import { capitalize, checkPermission, defer, edit, emojis, error, getSubcmd, getSubcmdGroup, getValue, respond } from "modules"
import * as otpauth from "otpauth"

export const cmd: CreateApplicationCommand = {
  name: "manage",
  description: "Useful commands for server managing",
  defaultMemberPermissions: ["USE_SLASH_COMMANDS"],
  options: [
    {
      name: "check",
      description: "Check some server informations",
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: "position",
          description: "Check the channels' position",
          type: ApplicationCommandOptionTypes.SubCommand,
        },
      ],
    },
    {
      name: "create",
      description: "Create something for the server",
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: "text",
          description: "Create a text channel",
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: "name",
              description: "The channel's name [Length 1~100]",
              type: ApplicationCommandOptionTypes.String,
              required: true,
            },
            {
              name: "topic",
              description: "The channel's topic [Length 0~1024]",
              type: ApplicationCommandOptionTypes.String,
              required: false,
            },
            {
              name: "below",
              description: "Where to put the channel below (Default Top) [Text/Category]",
              type: ApplicationCommandOptionTypes.Channel,
              channelTypes: [ChannelTypes.GuildText, ChannelTypes.GuildCategory],
              required: false,
            },
            {
              name: "slowmode",
              description: "Slowmode cooldown in seconds [Integer 0~21600]",
              type: ApplicationCommandOptionTypes.Integer,
              minValue: 0,
              maxValue: 21600,
              required: false,
            },
            {
              name: "restricted",
              description: "If the channel is NSFW (Default False)",
              type: ApplicationCommandOptionTypes.Boolean,
              required: false,
            },
            {
              name: "reason",
              description: "Reason for creation [Length 0~512]",
              type: ApplicationCommandOptionTypes.String,
              required: false,
            },
          ],
        },
        {
          name: "category",
          description: "Create a category",
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: "name",
              description: "The category's name [Length 1~100]",
              type: ApplicationCommandOptionTypes.String,
              required: true,
            },
            {
              name: "below",
              description: "Where to put the category below (Default Top) [Category]",
              type: ApplicationCommandOptionTypes.Channel,
              channelTypes: [ChannelTypes.GuildCategory],
              required: false,
            },
            {
              name: "reason",
              description: "Reason for creation [Length 0~512]",
              type: ApplicationCommandOptionTypes.String,
              required: false,
            },
          ],
        },
        {
          name: "voice",
          description: "Create a voice channel",
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: "name",
              description: "The channel's name [Length 1~100]",
              type: ApplicationCommandOptionTypes.String,
              required: true,
            },
            {
              name: "type",
              description: "The channel's type (Default Voice)",
              type: ApplicationCommandOptionTypes.Integer,
              choices: [
                { name: "Voice", value: ChannelTypes.GuildVoice },
                { name: "Stage", value: ChannelTypes.GuildStageVoice },
              ],
              required: false,
            },
            {
              name: "below",
              description: "Where to put the channel below (Default Top) [Voice/Category]",
              type: ApplicationCommandOptionTypes.Channel,
              channelTypes: [ChannelTypes.GuildVoice, ChannelTypes.GuildStageVoice, ChannelTypes.GuildCategory],
              required: false,
            },
            {
              name: "bitrate",
              description: "Audio bitrate in Kbps [Integer 0~384]",
              type: ApplicationCommandOptionTypes.Integer,
              minValue: 8,
              maxValue: 384,
              required: false,
            },
            {
              name: "user-limit",
              description: "Maximum amount of user able to join [Integer 0~99]",
              type: ApplicationCommandOptionTypes.Integer,
              minValue: 0,
              maxValue: 99,
              required: false,
            },
            {
              name: "reason",
              description: "Reason for creation [Length 0~512]",
              type: ApplicationCommandOptionTypes.String,
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: "delete",
      description: "Delete something in the server",
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: "channel",
          description: "Delete a channel",
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: "channel",
              description: "The channel to delete [Channel]",
              type: ApplicationCommandOptionTypes.Channel,
              channelTypes: [ChannelTypes.GuildText, ChannelTypes.GuildCategory, ChannelTypes.GuildVoice],
              required: true,
            },
            {
              name: "reason",
              description: "Reason for deleting the channel [Length 0~512]",
              type: ApplicationCommandOptionTypes.String,
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: "edit",
      description: "Edit something in the server",
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: "channel",
          description: "Edit a channel",
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: "channel",
              description: "The channel to edit [Channel]",
              type: ApplicationCommandOptionTypes.Channel,
              required: true,
            },
            {
              name: "name",
              description: "The channel's name [Length 1~100]",
              type: ApplicationCommandOptionTypes.String,
              required: false,
            },
            {
              name: "topic",
              description: "The channel's topic [Length 0~1024]",
              type: ApplicationCommandOptionTypes.String,
              required: false,
            },
            {
              name: "below",
              description: "Where to put the channel below [Text/Category]",
              type: ApplicationCommandOptionTypes.Channel,
              channelTypes: [ChannelTypes.GuildText, ChannelTypes.GuildCategory],
              required: false,
            },
            {
              name: "slowmode",
              description: "Slowmode cooldown in seconds [Integer 0~21600]",
              type: ApplicationCommandOptionTypes.Integer,
              minValue: 0,
              maxValue: 21600,
              required: false,
            },
            {
              name: "restricted",
              description: "If the channel is NSFW",
              type: ApplicationCommandOptionTypes.Boolean,
              required: false,
            },
            {
              name: "archive-duration",
              description: "Default duration to auto archive threads",
              type: ApplicationCommandOptionTypes.Integer,
              choices: [
                { name: "1 Hour", value: 60 },
                { name: "1 Day", value: 1440 },
                { name: "3 Days", value: 4320 },
                { name: "1 Week", value: 10080 },
              ],
              required: false,
            },
            {
              name: "bitrate",
              description: "Audio bitrate in Kbps for Voice channels [Integer 0~384]",
              type: ApplicationCommandOptionTypes.Integer,
              minValue: 8,
              maxValue: 384,
              required: false,
            },
            {
              name: "user-limit",
              description: "Maximum amount of user able to join for Voice channels [Integer 0~99]",
              type: ApplicationCommandOptionTypes.Integer,
              minValue: 0,
              maxValue: 99,
              required: false,
            },
            {
              name: "region",
              description: "The region for Voice channels",
              type: ApplicationCommandOptionTypes.String,
              autocomplete: true,
              required: false,
            },
            {
              name: "video-quality",
              description: "Video quality for Voice channels",
              type: ApplicationCommandOptionTypes.Integer,
              choices: [
                { name: "Auto", value: 1 },
                { name: "720p", value: 2 },
              ],
              required: false,
            },
            {
              name: "reason",
              description: "Reason for edit [Length 0~512]",
              type: ApplicationCommandOptionTypes.String,
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: "eval",
      description: "Evaluate a code [Bot Owner Only]",
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [{
        name: "otp",
        description: "One Time Password for validation",
        type: ApplicationCommandOptionTypes.String,
        required: true,
      }],
    },
    {
      name: "purge",
      description: "Purge messages",
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: "amount",
          description: "Amount of messages to purge [Integer 1~100]",
          type: ApplicationCommandOptionTypes.Integer,
          minValue: 1,
          maxValue: 100,
          required: true,
        },
        {
          name: "option",
          description: "Option to filter messages",
          type: ApplicationCommandOptionTypes.String,
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
          type: ApplicationCommandOptionTypes.User,
          required: false,
        },
        {
          name: "reason",
          description: "Reason for creation [Length 0~512]",
          type: ApplicationCommandOptionTypes.String,
          required: false,
        },
      ],
    },
  ],
}

const otp = new otpauth.TOTP({
  issuer: "Endy3032",
  label: "EndyBotOTP",
  algorithm: "SHA1",
  digits: 8,
  period: 30,
  secret: Deno.env.get("OTP"),
})

export async function execute(bot: Bot, interaction: Interaction) {
  if (!interaction.guildId) return respond(bot, interaction, `${emojis.warn.shorthand} This command can only be used in servers.`, true)

  switch (getSubcmdGroup(interaction)) {
    case "check": {
      switch (getSubcmd(interaction)) {
        case "position": {
          const channels = (await bot.helpers.getChannels(interaction.guildId)).array().sort((a, b) => (a.position ?? 0) > (b.position ?? 1) ? 1 : -1)

          await respond(bot, interaction, {
            embeds: [{
              title: "Channels Position",
              fields: [
                { name: "Categories", value: `${channels.filter(channel => channel.type == ChannelTypes.GuildCategory).map(channel => `<#${channel.id}> ${channel.position}`).join("\n")}`, inline: false },
                { name: "Text Channels", value: `${channels.filter(channel => channel.type == ChannelTypes.GuildText).map(channel => `<#${channel.id}> ${channel.position}`).join("\n")}`, inline: false },
                { name: "Voice Channels", value: `${channels.filter(channel => channel.type == ChannelTypes.GuildVoice).map(channel => `<#${channel.id}> ${channel.position}`).join("\n")}`, inline: false },
              ],
            }],
          })
          break
        }
      }
      break
    }

    case "create": {
      await defer(bot, interaction, true)
      if (checkPermission(bot, interaction, Permissions.MANAGE_CHANNELS)) return
      const channelName = getValue(interaction, "name", "String") ?? "channel"
      const reason = getValue(interaction, "reason", "String") ?? `Created by ${interaction.user.username}#${interaction.user.discriminator}`
      let parentId: bigint | undefined = undefined, position = 0
      const options: CreateGuildChannel = { name: channelName }
      const channels = await bot.helpers.getChannels(interaction.guildId)

      switch (getSubcmd(interaction)) {
        case "category": {
          const below = getValue(interaction, "below", "Channel")
          const belowPos = channels.find(channel => channel.id == below?.id)?.position
          position = belowPos ? belowPos + 1 : 0

          Object.assign<CreateGuildChannel, Partial<CreateGuildChannel>>(options, { type: ChannelTypes.GuildCategory, position })
          break
        }

        case "text": {
          const below = getValue(interaction, "below", "Channel")
          const nsfw = getValue(interaction, "nsfw", "Boolean") ?? false
          const slowmode = getValue(interaction, "slowmode", "Integer") ?? 0
          const topic = getValue(interaction, "topic", "String") ?? undefined

          if (below?.type === ChannelTypes.GuildCategory) {
            parentId = below.id
            position = channels.filter(channel => channel.parentId === parentId).array()
              .reduce((a, b) => (a.position ?? 0) < (b.position ?? 0) ? a : b).position ?? 0
          } else if (below?.type === ChannelTypes.GuildText) {
            const channel = await bot.helpers.getChannel(below.id)
            parentId = channel?.parentId ?? undefined
            position = channel?.position ? channel.position + 1 : 0
          }

          Object.assign<CreateGuildChannel, Partial<CreateGuildChannel>>(options, {
            type: ChannelTypes.GuildText,
            rateLimitPerUser: slowmode,
            topic,
            nsfw,
            position,
            parentId,
          })
          break
        }

        case "voice": {
          const below = getValue(interaction, "below", "Channel")
          const bitrate = getValue(interaction, "bitrate", "Integer") ?? 32000
          const userLimit = getValue(interaction, "user-limit", "Integer") ?? 0
          const type = getValue(interaction, "type", "Integer") ?? ChannelTypes.GuildVoice

          if (below?.type === ChannelTypes.GuildCategory) {
            parentId = below.id
            position = channels.filter(channel => channel.parentId === parentId).array()
              .reduce((a, b) => (a.position ?? 0) < (b.position ?? 0) ? a : b).position ?? 0
          } else if (below?.type === ChannelTypes.GuildVoice) {
            const channel = await bot.helpers.getChannel(below.id)
            parentId = channel?.parentId ?? undefined
            position = channel?.position ? channel.position + 1 : 0
          }

          Object.assign<CreateGuildChannel, Partial<CreateGuildChannel>>(options, {
            type,
            bitrate,
            userLimit,
            position,
            parentId,
          })
          break
        }
      }

      await bot.helpers.createChannel(interaction.guildId, options, reason)
        .then(async channel => {
          await respond(bot, interaction, `${emojis.success.shorthand} Created ${getSubcmd(interaction)} channel <#${channel.id}>`)

          const swapOptions: ModifyGuildChannelPositions[] = channels.filter(channel => channel.type == options.type)
            .map(channel => {
              return { id: channel.id.toString(), position: (channel.position ?? 0) >= (options.position ?? 0) ? (channel.position ?? 0) + 1 : channel.position }
            })

          swapOptions.push({ id: channel.id.toString(), position: options.position ?? 0 })
          await bot.helpers.swapChannels(channel.guildId, swapOptions)
        })
        .catch(async err => console.botLog(err))
      break
    }

    case "delete": {
      if (checkPermission(bot, interaction, Permissions.MANAGE_CHANNELS)) return
      switch (getSubcmd(interaction)) {
        case "channel": {
          const channel = getValue(interaction, "channel", "Channel")
          const reason = getValue(interaction, "reason", "String") ?? `Deleted by ${interaction.user.username}#${interaction.user.discriminator}`

          await respond(bot, interaction, {
            content: `Confirm to delete <#${channel?.id}> with the following reason: ${reason}`,
            components: [{
              type: MessageComponentTypes.ActionRow,
              components: [{
                type: MessageComponentTypes.Button,
                label: "Delete",
                customId: `delete-channel-${channel?.id}`,
                style: ButtonStyles.Danger,
                emoji: { id: emojis.trash.id },
              }],
            }],
          }, true)
          break
        }
      }
      break
    }

    case "edit": {
      if (checkPermission(bot, interaction, Permissions.MANAGE_CHANNELS)) return
      switch (getSubcmd(interaction)) {
        case "channel": {
          const channel = getValue(interaction, "channel", "Channel")
          if (channel === null) return respond(bot, interaction, "Cannot get the channel", true)
          const rateLimitPerUser = getValue(interaction, "slowmode", "Integer") ?? undefined

          await bot.helpers.editChannel(channel.id, { rateLimitPerUser })
          break
        }
      }
      break
    }

    default: {
      switch (getSubcmd(interaction)) {
        case "eval": {
          const app = await bot.helpers.getApplicationInfo()
          const ownerID = (app.team ? app.team.ownerUserId : app.owner?.id) ?? bot.id
          if (interaction.user.id !== ownerID) return respond(bot, interaction, "You aren't allowed to use this command", true)

          const token = getValue(interaction, "otp", "String")
          if (token === null) return respond(bot, interaction, "Cannot retrieve OTP, try again", true)
          if (otp.validate({ token, window: 1 }) === null) return respond(bot, interaction, "Invalid OTP, try again", true)

          await respond(bot, interaction, {
            title: "Eval",
            customId: "manage_eval",
            components: [{
              type: MessageComponentTypes.ActionRow,
              components: [{
                type: MessageComponentTypes.InputText,
                style: TextStyles.Paragraph,
                customId: "code",
                label: "Code",
                required: true,
              }],
            }],
          })
          break
        }

        case "purge": {
          if (checkPermission(bot, interaction, Permissions.MANAGE_MESSAGES)) return
          const amount = getValue(interaction, "amount", "Integer") ?? 0
          const option = getValue(interaction, "option", "String")
          const user = getValue(interaction, "user", "User")
          const reason = getValue(interaction, "reason", "String") ?? `Purged by ${interaction.user.username}#${interaction.user.discriminator}`

          let content = `Confirm to delete \`${amount}\` messages `
          content += option && user
            ? `from <@${user.user.id}> and ${option} only `
            : option || user
            ? `from ${user ? `<@${user.user.id}>` : option} only `
            : ""
          content += `with the following reason: ${reason}`

          await respond(bot, interaction, {
            content,
            components: [{
              type: MessageComponentTypes.ActionRow,
              components: [{
                type: MessageComponentTypes.Button,
                label: "Delete",
                customId: `delete-messages-${amount}-${option}-${user?.user.id}`,
                style: ButtonStyles.Danger,
                emoji: { id: emojis.trash.id },
              }],
            }],
          }, true)
          break
        }
      }
    }
  }
}

const purge = (bot: Bot, channelId: bigint, messages: bigint[], reason?: string) => {
  if (messages.length > 1) return bot.helpers.deleteMessages(channelId, messages, reason)
  else return bot.helpers.deleteMessage(channelId, messages[0], reason)
}

export async function button(bot: Bot, interaction: Interaction) {
  const customID = (interaction.data?.customId ?? "").split("-")
  const [action, type] = customID
  switch (action) {
    case "delete": {
      await defer(bot, interaction)
      switch (type) {
        case "channel": {
          if (checkPermission(bot, interaction, Permissions.MANAGE_CHANNELS)) return
          const [, , channelID] = customID
          const reason = interaction.message?.content.split(": ")[1] ?? `Purged by ${interaction.user.username}#${interaction.user.discriminator}`
          await bot.helpers.deleteChannel(BigInt(channelID), reason)
            .then(() => respond(bot, interaction, { content: `${emojis.success.shorthand} Deleted the channel`, components: [] }))
            .catch(err => error(bot, interaction, err, "Channel Deletion", true))
          break
        }

        case "messages": {
          if (checkPermission(bot, interaction, Permissions.MANAGE_MESSAGES)) return
          if (interaction.channelId === undefined) return respond(bot, interaction, "Cannot get current channel")
          const [, , amount, option, user] = customID
          const reason = interaction.message?.content.split(": ")[1] ?? `Purged by ${interaction.user.username}#${interaction.user.discriminator}`

          let clear = (await bot.helpers.getMessages(interaction.channelId, { limit: parseInt(amount) }))
          if (option != "null" || user != "undefined") {
            clear = clear.filter(msg => {
              let cond = false
              if (option == "bots") cond = cond || msg.isBot
              if (option == "users") cond = cond || !msg.isBot
              if (user != "undefined") cond = cond || (msg.authorId == BigInt(user))
              return cond
            })
          }

          if (clear.length < 1) return await respond(bot, interaction, `${emojis.warn.shorthand} Found no messages to purge`)
          else {
            await purge(bot, interaction.channelId, clear.map(msg => msg.id), reason)
              .then(() => {
                respond(bot, interaction, `${emojis.success.shorthand} Found and purged ${clear.length}/${amount} messages`)
                console.botLog(`Found and purged ${clear.length}/${amount} messages`)
              })
              .catch(err => error(bot, interaction, err, "Message Purge", true))
          }
        }
      }
    }
  }
}

const transformRegion = (choices: ApplicationCommandOptionChoice[], property: keyof Omit<VoiceRegions, "name" | "id">) => {
  return choices.filter(region => region.name.toLowerCase().includes(property))
}

export async function autocomplete(bot: Bot, interaction: Interaction) {
  if (interaction.guildId === undefined) {
    return await respond(bot, interaction, {
      choices: [{ name: "This command can only be used in a server", value: "null" }],
    })
  }

  const choices: ApplicationCommandOptionChoice[] = (await bot.helpers.getVoiceRegions(interaction.guildId)).array().map(region => {
    let { name } = region
    if (region.optimal) name += " [Optimal]"
    if (region.deprecated) name += " [Deprecated]"
    if (region.custom) name += " [Custom]"
    return { name, value: region.id }
  })

  const optimal = transformRegion(choices, "optimal")
  const deprecated = transformRegion(choices, "deprecated")
  const custom = transformRegion(choices, "custom")
  const abnormal = [...optimal, ...deprecated, ...custom]

  await respond(bot, interaction, { choices: [...optimal, ...custom, ...choices.filter(choice => !abnormal.includes(choice)), ...deprecated] })
}

export async function modal(bot: Bot, interaction: Interaction) {
  await defer(bot, interaction)
  const code = getValue(interaction, "code", "Modal")
  var response = `**Code**\n\`\`\`ts\n${code}\`\`\`\n`
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const discordeno = await import("discordeno")

  try {
    let output = Deno.inspect(await eval(code?.replaceAll("await ", "") ?? ""), { compact: false })
    for (const brack of ["()", "[]", "{}"]) output = output.replaceAll(new RegExp(`(\\${brack.charAt(0)}\\n\\s+\\${brack.charAt(1)},)`, "gm"), `${brack},`)
    if (output !== undefined) response += `**Output**\n\`\`\`ts\n${output} [typeof ${capitalize(typeof output)}]\`\`\``
  } catch (err) {
    response += `**Error**\n\`\`\`ts\n${err.stack.replaceAll(Deno.cwd(), "EndyJS").replaceAll("    ", "  ")}\`\`\``
  }

  respond(bot, interaction, response)
}
