import { WebSocket } from "ws"
import { EventEmitter } from "node:events"
import { GatewayOpcodes } from "discord-api-types/v10"

export class Client extends EventEmitter {
  ws?: WebSocket

  constructor() {
    super()
  }
  
  async connect(): Promise<void> {
    this.ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json")

    this.ws.on("message", (data: Buffer) => {
      const payload = JSON.parse(data.toString())

      switch (payload.op) {
        case GatewayOpcodes.Hello: {
          this.emit("hello", payload)
          break
        }

        case GatewayOpcodes.Heartbeat: {
          this.emit("heartbeat", payload)
          break
        }
      }
    })
  }
}