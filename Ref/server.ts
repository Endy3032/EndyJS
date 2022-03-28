import os from "os"
import morgan from "morgan"
import express from "express"
import { createWriteStream } from "fs"

const server = express()
const port = 3032

var httplog = !os.hostname().includes("local") ? createWriteStream("./logs/http.log", { flags: "a" }) : null
server.use(morgan("[:date[web]] \":method :url\" :status :user-agent", { stream: httplog }))

server.all("/", (_, res) => {
  res.send("Website coming in the future\nStay tuned")
})

function keepAlive() {
  server.listen(port, () => {console.tagLog("Server", "Ready")})
}

export default keepAlive