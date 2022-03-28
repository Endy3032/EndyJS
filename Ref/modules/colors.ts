import { Chalk } from "chalk"
const chalkLog = new Chalk({ level: 3 })

export const colors = [
  "5865F2", "57F287", "FEE75C", "EB459E", "ED4245",
  "F47B67", "F8A532", "48B784", "45DDCO", "99AAB5",
  "23272A", "B7C2CE", "4187ED", "36393F", "3E70DD",
  "4P5D7F", "7289DA", "4E5D94", "9C84EF", "F47FFF",
  "FFFFFF", "9684ec", "583694", "37393e", "5866ef",
  "3da560", "f9a62b", "f37668", "49ddc1", "4f5d7e",
  "09bOf2", "2f3136", "ec4145", "fe73f6", "000000"
]

export const nordChalk = {
  // Polar Night
  night1: chalkLog.hex("2E3440"),
  night2: chalkLog.hex("3B4252"),
  night3: chalkLog.hex("434C5E"),
  night4: chalkLog.hex("4C566A"),

  // Snow Storm
  storm1: chalkLog.hex("D8DEE9"),
  storm2: chalkLog.hex("E5E9F0"),
  storm3: chalkLog.hex("ECEFF4"),

  // Frost
  frost1: chalkLog.hex("8FBCBB"),
  frost2: chalkLog.hex("88C0D0"),
  frost3: chalkLog.hex("81A1C1"),
  frost4: chalkLog.hex("5E81AC"),

  // Aurora + Default Colors
  red: chalkLog.hex("BF616A"),
  orange: chalkLog.hex("D08770"),
  yellow: chalkLog.hex("EBCB8B"),
  green: chalkLog.hex("A3BE8C"),
  cyan: chalkLog.hex("88C0D0"),
  blue: chalkLog.hex("81A1C1"),
  magenta: chalkLog.hex("B48EAD"),
  black: chalkLog.hex("2E3440"),
  white: chalkLog.hex("ECEFF4"),
  info: chalkLog.bold.hex("A3BE8C"),
  warn: chalkLog.bold.hex("EBCB8B"),
  error: chalkLog.bold.hex("BF616A"),
  debug: chalkLog.bold.hex("D08770"),

  bright: {
    // Polar Night
    night1: chalkLog.hex("3E4450"),
    night2: chalkLog.hex("4B5262"),
    night3: chalkLog.hex("535C6E"),
    night4: chalkLog.hex("5C667A"),
    
    // Snow Storm
    storm1: chalkLog.hex("E8EEF9"),
    storm2: chalkLog.hex("F5F9F0"),
    storm3: chalkLog.hex("FCFFF4"),
    
    // Frost
    frost1: chalkLog.hex("9FCCCB"),
    frost2: chalkLog.hex("98D0E0"),
    frost3: chalkLog.hex("91B1D1"),
    frost4: chalkLog.hex("6E91BC"),

    // Aurora
    red: chalkLog.hex("CF717A"),
    orange: chalkLog.hex("E09780"),
    yellow: chalkLog.hex("FBDB9B"),
    green: chalkLog.hex("B3CE9C"),
    cyan: chalkLog.hex("98D0E0"),
    blue: chalkLog.hex("91B1D1"),
    magenta: chalkLog.hex("C49EBD"),
    black: chalkLog.hex("3E4450"),
    white: chalkLog.hex("FCFFF4"),
    info: chalkLog.bold.hex("B3CE9C"),
    warn: chalkLog.bold.hex("FBDB9B"),
    error: chalkLog.bold.hex("CF717A"),
    debug: chalkLog.bold.hex("E09780")
  },

  dark: {
    // Polar Night
    night1: chalkLog.hex("1E2430"),
    night2: chalkLog.hex("2B3242"),
    night3: chalkLog.hex("333C4E"),
    night4: chalkLog.hex("3C465A"),

    // Snow Storm
    storm1: chalkLog.hex("C8CED9"),
    storm2: chalkLog.hex("D5D9E0"),
    storm3: chalkLog.hex("DCDFE4"),

    // Frost
    frost1: chalkLog.hex("7FACAB"),
    frost2: chalkLog.hex("78B0C0"),
    frost3: chalkLog.hex("7191B1"),
    frost4: chalkLog.hex("5E719C"),

    // Aurora
    red: chalkLog.hex("AF515A"),
    orange: chalkLog.hex("C07760"),
    yellow: chalkLog.hex("CBBB7B"),
    green: chalkLog.hex("93AE7C"),
    cyan: chalkLog.hex("78B0C0"),
    blue: chalkLog.hex("7191B1"),
    magenta: chalkLog.hex("A47E9D"),
    black: chalkLog.hex("1E2430"),
    white: chalkLog.hex("DCDFE4"),
    info: chalkLog.bold.hex("93AE7C"),
    warn: chalkLog.bold.hex("CBBB7B"),
    error: chalkLog.bold.hex("AF515A"),
    debug: chalkLog.bold.hex("C07760")
  }
}
