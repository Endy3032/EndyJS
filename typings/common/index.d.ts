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
}

export {}