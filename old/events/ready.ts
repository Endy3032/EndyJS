import os from "os"
import { Client } from "discord.js"
import { activities, nordChalk, random } from "../modules"
import axios, { AxiosError, AxiosResponse } from "axios"

export const name = "ready"
export const once = true

export async function execute(client: Client) {
  os.hostname().includes("local")
    ? console.botLog(`${nordChalk.bright.cyan("[VSCode]")} Client Ready`)
    : console.botLog(`${nordChalk.bright.cyan("[Replit]")} Client Ready`)

  function pinger() {
    const servers = ["pinger", "endyjs"]
    servers.forEach(server => {
      axios.head(`https://${server}.endy3032.repl.co`)
        .catch((err: AxiosError) => {
          if (err.response) console.botLog(`${nordChalk.bright.cyan(`[${server}]`)} ${nordChalk.error(`${err.response.status} ${err.response.statusText}`)}`, "WARN")
        })
    })
  }

  function reloadPresence() {
    if (os.hostname().includes("local")) {
      const activity = random.pickFromArray(activities as [any])
      const act_type = activity.activities[0]["type"]
      const act_name = activity.activities[0]["name"]
      const type_str = ["Playing", "Streaming", "Listening to", "Watching"]

      client?.user?.setPresence(activity)

      if (act_name == "lofi") {
        axios.get(`https://noembed.com/embed?url=${activity.activities[0].url}`)
          .then((res: AxiosResponse) => {console.botLog(`${nordChalk.bright.cyan("[Status]")} ${type_str[act_type]} ${act_name} ${nordChalk.bright.cyan(`${res.data.title} • ${activity.activities[0]["url"].replace("www.youtube.com/watch?v=", "youtu.be/")}`)}`)})
      } else console.botLog(`${nordChalk.bright.cyan("[Status]")} ${type_str[act_type]} ${act_name}`, "INFO", { description: `**Status** • ${type_str[act_type]} ${act_name}` })
    }
  }

  pinger()
  reloadPresence()
  setInterval(() => { pinger(); reloadPresence() }, 300000)

  // client?.user?.setPresence(random.pickFromArray(activities))
  // clientcmd = client.application.commands.fetch()
  // .then(cmds => console.log(cmds))

  client?.application?.commands.fetch()
    .then(commands => console.botLog(`${nordChalk.bright.cyan("[Global]")} Fetched ${commands.size} commands`))
    .catch(console.error)

  const guild = client.guilds.cache.get("864972641219248140")
  // commands = guild.commands
  guild?.commands.fetch()
    .then(commands => console.botLog(`${nordChalk.bright.cyan("[ Test ]")} Fetched ${commands.size} commands`))
    .catch(console.error)

  // delete_cmd = false
  // delete_cmd ? guild.commands.set([]) : null
}

/*
const Guilds = client.guilds.cache.map(guild => (guild.id))
const channel = client.channels.cache.get(process.env.Log)

console.log(Guilds[0])
const guildd = client.guilds.cache.get(String(Guilds[0]))
// console.log(guildd.members.cache.map(guild => (guild.members.username, guild.members.discriminator)))
guildd.members.fetch()
.then((guild) => {console.log(guild)})
// .then((ls)=>{console.log(ls)})
// .catch((er) => {console.error(er)})

await Guilds.forEach(guildId => {
  const guild = client.guilds.cache.get(guildId)
  console.log('Fetching...')
  guild.members.fetch()
  .then(members => {
    console.log(members)
    // members = members.map(mem => mem.code)
    // channel.send(`discord.gg/${invites[0]}\n`)
  })
  .catch((err) => {console.error(err)})
}) */