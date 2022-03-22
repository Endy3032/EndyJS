import { PermissionFlagsBits } from "discord.js"

permissionNames = Object.keys(PermissionFlagsBits).map(permission => permission.match(/[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g).join(" ").replace("VAD", "VAD (Voice Activity)"))
export default Object.assign(...Object.values(PermissionFlagsBits).map((val, index) => ({ [val]: permissionNames[index] })))
