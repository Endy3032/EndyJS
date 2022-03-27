import DestructObject from "./DestructObject"
import { ApplicationCommandOptionTypes, Bot, DiscordInteractionDataOption, Interaction } from "discordeno"

export class InteractionOptions extends DestructObject {
  client: Bot
  options: DiscordInteractionDataOption
  group: string | null
  subcommand: string | null

  constructor(client: Bot, interaction: Interaction) {
    super(interaction)
    this.client = client,
    this.options = interaction.data?.options as unknown as DiscordInteractionDataOption
    this.group = null
    this.subcommand = null
    
    if (this.options.type === ApplicationCommandOptionTypes.SubCommandGroup) {
      this.group = this.options[0].name
      this.options = this.options[0].options
    }

    if (this.options.type === ApplicationCommandOptionTypes.SubCommand) {
      this.subcommand = this.options[0].name
      this.options = this.options[0].options ?? []
    }
  }

  getSubcommand(): string | null {
    return this.subcommand
  }

  getSubcommandGroup(): string | null {
    return this.group
  }
}

// import { Interaction } from "discordeno"

// class InteractionOptions implements Interaction {

// }

// Interaction.prototype.getSubcommand = function(interaction: Interaction): string {
//   interaction.data.options.type === ApplicationCommandOptionTypes.SubCommand
//     ? interaction.data.options.name
//     : interaction.data.options.type === ApplicationCommandOptionTypes.SubCommandGroup
//       ? interaction.data.options.options.name
//       : null
// }

// // import Guild from "./Guild"
// // import Channel from "./Channel"
// // import DestructObject from "./DestructObject"

// // export class Interaction extends DestructObject {
// //   raw: {}
// //   client: any
// //   guild: Guild
// //   guild_id: any
// //   guildId: any
// //   channel: Channel
// //   channel_id: any
// //   channelId: any
// //   type: number | undefined
// //   deferred: any
// //   replied: any
// //   ephemeral: any
// //   messageId: any

// //   constructor(client: any, interaction = {}) {
// //     super(interaction)
// //     this.raw = interaction
// //     this.client = client

// //     this.guild = new Guild(client, { id: this.guild_id || this.guildId })
// //     this.channel = new Channel(client, { id: this.channel_id || this.channelId }, {
// //       internal: true,
// //       guild: this.guild,
// //     })
// //   }

// //   isCommand() { return this.type === InteractionTypes.ApplicationCommand }

// //   isChatInputCommand() {
// //     return this.type === ApplicationCommandTypes.ChatInput
// //   }

// //   isContextMenuCommand() {
// //     return this.type !== ApplicationCommandTypes.ChatInput
// //   }

// //   isUserContextMenuCommand() {
// //     return this.type === ApplicationCommandTypes.User
// //   }

// //   isMessageContextMenuCommand() {
// //     return this.type === ApplicationCommandTypes.Message
// //   }

// //   isMessageComponent() {
// //     return this.type === InteractionTypes.MessageComponent
// //   }

// //   isSelectMenu() {
// //     return this.type === InteractionTypes.MessageComponent && this.message.components
// //   }

// //   isButton() {
// //     return this.type === Constants.INTERACTION_TYPES.MESSAGE_COMPONENT
// //   }

// //   isAutoComplete() {
// //     return this.type === Constants.INTERACTION_TYPES.APPLICATION_COMMAND_AUTOCOMPLETE
// //   }

// //   async deferReply(options = {}) {
// //     if (this.deferred || this.replied) throw new Error("Interaction has been already replied")
// //     const Payload = { data: {}, type: Constants.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE }
// //     options.type = 5
// //     if (this.ephemeral) options.private = true
// //     this.ephemeral = options.ephemeral || false
// //     this.deferred = true
// //     return this.client.helpers.sendInteractionResponse(this.id, this.token, options)
// //   }
// //   id(id: any, token: any, options: {}) {
// //     throw new Error("Method not implemented.")
// //   }
// //   token(id: any, token: any, options: {}) {
// //     throw new Error("Method not implemented.")
// //   }

// //   async deferUpdate(options = {}) {
// //     if (this.deferred || this.replied) throw new Error("Interaction has been already replied")
// //     this.deferred = true
// //     const Payload = { data: options, type: Constants.DEFERRED_UPDATE_MESSAGE }
// //     return this.client.helpers.sendInteractionResponse(this.id, this.token, Payload)
// //   }

// //   async reply(options = {}) {
// //     if (this.deferred || this.replied) throw new Error("Interaction has been already replied")
// //     this.ephemeral = options.ephemeral || false
// //     if (this.ephemeral) options.private = true
// //     this.replied = true
// //     const Payload = { data: options, type: Constants.CHANNEL_MESSAGE_WITH_SOURCE }
// //     return this.client.helpers.sendInteractionResponse(this.id, this.token, Payload)
// //   }

// //   async popupModal(options = {}) {
// //     if (this.deferred || this.replied) throw new Error("Interaction has been already replied")
// //     const Payload = { data: options, type: Constants.MODAL }
// //     this.replied = true
// //     return this.client.helpers.sendInteractionResponse(this.id, this.token, Payload)
// //   }

// //   async editReply(options = {}) {
// //     if (!this.deferred && !this.replied) throw new Error("Interaction has not been replied")
// //     this.replied = true
// //     const messageId = this.messageId ? this.messageId : options.messageId
// //     return this.client.helpers.editInteractionResponse(this.token, options)
// //   }

// //   async deleteReply(options = {}) {
// //     if (this.ephemeral) throw new Error("Ephemeral messages cannot be deleted")
// //     const messageId = this.messageId ? this.messageId : options.messageId
// //     return this.client.helpers.deleteInteractionResponse(this.token, messageId)
// //   }

// //   async followUp(options = {}) {
// //     if (!this.replied || !this.deferred) throw new Error("Interaction has not been replied")
// //     const Payload = { data: options, type: Constants.CHANNEL_MESSAGE_WITH_SOURCE }
// //     return this.client.helpers.sendInteractionResponse(this.id, this.token, Payload)
// //   }

// //   async update(options = {}) {
// //     if (this.deferred || this.replied) throw new Error("Interaction has been already replied")
// //     const Payload = { data: options, type: Constants.UPDATE_MESSAGE }
// //     this.replied = true
// //     return this.client.helpers.sendInteractionResponse(this.id, this.token, Payload)
// //   }
// // }
