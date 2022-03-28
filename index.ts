import { Client } from "./Structures"

const client = new Client()

client.on("hello", (payload) => {
  console.log(payload)
})

client.on("heartbeat", (payload) => {
  console.log(payload)
})

client.connect()