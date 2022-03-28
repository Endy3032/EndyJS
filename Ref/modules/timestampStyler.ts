export default (timestamp: number, mode: string) => {
  const ts = Math.floor(timestamp / 1000)
  switch (mode) {
    case "stime": return `<t:${ts}:t>`
    case "ltime": return `<t:${ts}:T>`
    case "sdate": return `<t:${ts}:d>`
    case "ldate": return `<t:${ts}:D>`
    case "sdt": return `<t:${ts}:f>`
    case "ldt": return `<t:${ts}:F>`
    case "rel": return `<t:${ts}:R>`
    case "full": return `Short Time: <t:${ts}:t>\nLong Time: <t:${ts}:T>\nShort Date: <t:${ts}:d>\nLong Date: <t:${ts}:D>\nShort Date Time: <t:${ts}:f>\nLong Date Time: <t:${ts}:F>\nRelative: <t:${ts}:R>`
    case "tsutils": return `\`${"Short Time".padEnd(15, " ")} | <t:${ts}:t>\` <t:${ts}:t>\n\`${"Long Time".padEnd(15, " ")} | <t:${ts}:T>\` <t:${ts}:T>\n\`${"Short Date".padEnd(15, " ")} | <t:${ts}:d>\` <t:${ts}:d>\n\`${"Long Date".padEnd(15, " ")} | <t:${ts}:D>\` <t:${ts}:D>\n\`${"Short Date Time".padEnd(15, " ")} | <t:${ts}:f>\` <t:${ts}:f>\n\`${"Long Date Time".padEnd(15, " ")} | <t:${ts}:F>\` <t:${ts}:F>\n\`${"Relative".padEnd(15, " ")} | <t:${ts}:R>\` <t:${ts}:R>`
  }
}