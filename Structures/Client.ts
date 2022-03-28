import { WebSocket } from "ws"
import { HeartbeatInfo } from "../Types"
import { EventEmitter } from "node:events"
import { GatewayHeartbeat, GatewayOpcodes } from "discord-api-types/v10"

export class Client extends EventEmitter {
  heartbeat: HeartbeatInfo = {
    first: true,
    acked: false,
    interval: 0,
    clock: null,
  }
  sequence: number | null = null
  ws?: WebSocket

  constructor() {
    super()
  }
  
  async connect(): Promise<void> {
    this.ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json")
    this.ws.on("message", (data: Buffer) => {
      const payload = JSON.parse(data.toString())
      if (payload.s != null) this.sequence = payload.s

      switch (payload.op) {
        case GatewayOpcodes.Heartbeat: {
          this.emit("hello", payload)
          this._sendHeartbeat()
          break
        }

        case GatewayOpcodes.Hello: {
          this.heartbeat.interval = payload.d.heartbeat_interval
          this.emit("hello", payload)
          this._handleHeartbeat()
          break
        }

        case GatewayOpcodes.HeartbeatAck: {
          this.heartbeat.acked = true
          this.emit("hello", payload)
          if (this.heartbeat.first) {
            this.heartbeat.first = false
          }
          break
        }
      }
    })
  }

  private _handleHeartbeat() {
    if (this.heartbeat.clock) clearInterval(this.heartbeat.clock)
    const beat = () => {
      if (!this.heartbeat.acked) {
        this.ws?.close(1002, "Heartbeat not acknowledged")
        if (this.heartbeat.interval) clearInterval(this.heartbeat.clock as NodeJS.Timeout)
        return this.connect()
      }
      this._sendHeartbeat()
    }
    beat()
    this.heartbeat.clock = setInterval(beat, this.heartbeat.interval)
  }
  
  private _sendHeartbeat() {
    this.heartbeat.acked = false
    const heartbeat: GatewayHeartbeat = {
      op: GatewayOpcodes.Heartbeat,
      d: this.sequence
    }
    if (this.ws) this.ws.send(JSON.stringify(heartbeat))
    else {this.emit("error", new Error("Client's WebSocket not initiated"))}
  }
}