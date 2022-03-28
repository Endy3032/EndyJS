export type HeartbeatInfo = {
  first: boolean
  acked: boolean
  interval: number
  clock: null | NodeJS.Timeout
}