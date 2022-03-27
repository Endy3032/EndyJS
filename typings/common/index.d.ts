declare global {
  interface Console {
    botLog: Function
    tagLog: Function
  }

  enum LogLevel {
    Info = 1,
    Warn = 2,
    Error = 3,
    Debug = 4
  }

  enum MsgFlags {
    Ephemeral = 1 << 6,
  }
  
  enum InteractionTypes {
    ApplicationCommand = 2,
    MessageComponent = 3,
    ApplicationCommandAutocomplete = 4,
    ModalSubmit = 5,
  }

  enum ApplicationCommandTypes {
    ChatInput = 1,
    User = 2,
    Message = 3,
  }

  enum ComponentTypes {
    ActionRow = 1,
    Button = 2,
    SelectMenu = 3,
    TextInput = 4,  
  }

  enum InteractionCallbackTypes {
    ChannelMessageWithSource = 4,
    DeferredMessageWithSource = 5,
    DeferredUpdateMessage = 6,
    UpdateMessage = 7,
    ApplicationCommandAutocompleteResult = 8,
    Modal = 9,
  }
}

export {}