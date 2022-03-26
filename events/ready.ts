import os from "os"
import axios from "axios"
import * as Discord from "discordeno"

export = async function (client: Discord.Bot, payload: any) {
  os.hostname().includes("local")
    ? console.log("[VSCode] Client Ready")
    : console.log("[Replit] Client Ready")
  // ? console.botLog(`${nordChalk.bright.cyan("[VSCode]")} Client Ready`)
  // : console.botLog(`${nordChalk.bright.cyan("[Replit]")} Client Ready`)
  const user = payload.user
  console.log(`Ready! [${user.username}$${user.discriminator}]`)
}