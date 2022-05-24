type escapeMarkdownOptions = {
  escapeAll?: boolean
  inlineCode?: boolean
  codeBlock?: boolean
  bold?: boolean
  italic?: boolean
  underline?: boolean
  spoiler?: boolean
  strikethrough?: boolean
}

// Taken from https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/util/Util.js
export const escapeMarkdown = (text: string, options: escapeMarkdownOptions = { escapeAll: true }) => {
  if (options.escapeAll) {
    options = {
      inlineCode: true, codeBlock: true,
      bold: true, italic: true, underline: true,
      spoiler: true, strikethrough: true,
    }
  }

  if (options.inlineCode) text = text.replace(/(?<=^|[^`])``?(?=[^`]|$)/g, match => (match.length == 2 ? "\\`\\`" : "\\`"))

  if (options.codeBlock) text = text.replaceAll("```", "\\`\\`\\`")

  if (options.bold) {
    let i = 0
    text = text.replace(/\*\*(\*)?/g, (_, match) => {
      if (match) return ++i % 2 ? `${match}\\*\\*` : `\\*\\*${match}`
      return "\\*\\*"
    })
  }

  if (options.italic) {
    let i = 0
    text = text.replace(/(?<=^|[^*])\*([^*]|\*\*|$)/g, (_, match) => {
      if (match === "**") return ++i % 2 ? `\\*${match}` : `${match}\\*`
      return `\\*${match}`
    })
    i = 0
    text = text.replace(/(?<=^|[^_])_([^_]|__|$)/g, (_, match) => {
      if (match === "__") return ++i % 2 ? `\\_${match}` : `${match}\\_`
      return `\\_${match}`
    })
  }

  if (options.underline) {
    let i = 0
    return text.replace(/__(_)?/g, (_, match) => {
      if (match) return ++i % 2 ? `${match}\\_\\_` : `\\_\\_${match}`
      return "\\_\\_"
    })
  }

  if (options.spoiler) text = text.replaceAll("||", "\\|\\|")

  if (options.strikethrough) text = text.replaceAll("~~", "\\~\\~")

  return text
}