import path from "node:path"
import { readdirSync } from "node:fs"

const resolveFolder = (folderName: string) => path.resolve(__dirname, ".", folderName)

class EventManager {
  cache: Map<any, any>
  private _events: {}

  constructor() {
    this.cache = new Map()
    this._events = {}
  }

  load() {
    const eventsFolder = resolveFolder("../events")
    readdirSync(eventsFolder).filter(file => file.endsWith(".ts")).forEach(async (file) => {
      const fileName = path.join(eventsFolder, file)
      const event = require(fileName)
      const [eventName] = file.split(".")

      this._events[`${eventName}`] = event
    })

    return this._events
  }
}

export = EventManager