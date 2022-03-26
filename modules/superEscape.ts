import { Util } from "discord.js"

export default (text: string) => {
  return Util.escapeMarkdown(String(text), { codeBlock: true, inlineCode: true, bold: true, italic: true, underline: true, strikethrough: true, spoiler: true, codeBlockContent: true, inlineCodeContent: true })
}