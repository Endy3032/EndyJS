import { nordChalk } from "./colors"

export default (tag: string, content: string) => {
  const logTime = new Date().toLocaleString("default", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",

    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 2
  }).replace(",", "")

  console.log(nordChalk.blue(`${logTime} ${nordChalk.info("INFO")}  | ${nordChalk.bright.cyan(`[${tag}]`)} ${content}`))
}