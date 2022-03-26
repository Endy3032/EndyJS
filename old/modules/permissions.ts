import { PermissionFlagsBits } from "discord.js"

const permissionNames = Object.keys(PermissionFlagsBits).map((permission: string) => {
  return permission.match(/[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g)?.join(" ").replace("VAD", "VAD (Voice Activity)")
})
const permissions = Object.assign(...Object.values(PermissionFlagsBits).map((val, index) => ({
  [val.toString()]: permissionNames[index]
})) as unknown as [string, string])

export default permissions