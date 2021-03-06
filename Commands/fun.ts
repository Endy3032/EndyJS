import axios from "axios"
import Fuse from "fuse.js"
import { colors, pickFromArray, randRange } from "../Modules"
import { Temporal } from "@js-temporal/polyfill"
import { APIActionRowComponent, APIEmbed, APIMessageActionRowComponent } from "discord-api-types/v10"
import { ActionRow, ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, Embed, EmbedBuilder, MessageActionRowComponent, MessageAttachment, ModalMessageModalSubmitInteraction, TextInputStyle } from "discord.js"

// #region Canvas Related Stuff
import fs from "fs"
import { imageSize } from "image-size"
import wordle from "../Resources/Wordle"
import { Canvas, CanvasRenderingContext2D, FontLibrary, loadImage } from "skia-canvas"

FontLibrary.use({
  LeagueSpartan: ["./Resources/Meme/LeagueSpartan-Regular.ttf"],
  ClearSans: ["./Resources/Wordle/ClearSans-Bold.ttf"]
})
// #endregion

function getCtx(canvas: Canvas) {
  const ctx = canvas.getContext("2d")
  ctx.textBaseline = "top"
  ctx.textAlign = "center"
  ctx.textWrap = true
  return ctx
}

function getFontSize(text: string, width: number, height: number) {
  return Math.min(height * 0.11, width * 0.09) * (0.975 ** Math.floor(text.length / 10))
}

function getMidY(ctx: CanvasRenderingContext2D, text: string, width: number, height: number) {
  const measurements = ctx.measureText(text, width)
  const textHeight = measurements.actualBoundingBoxDescent - measurements.actualBoundingBoxAscent
  return (height - textHeight) / 2
}

async function sendMeme(interaction: ChatInputCommandInteraction, canvas: Canvas, variant: string, text: string, separator: string) {
  const attachment = new MessageAttachment(await canvas.png, "meme.png")
  await interaction.editReply({ files: [attachment], embeds: [{
    color: parseInt(pickFromArray(colors), 16),
    image: { url: "attachment://meme.png" },
    footer: variant.includes("panik_kalm_panik") && text.split(separator).length < 3 ? { text: `Tip: Separate 3 texts with ${separator} to fill the whole template` } : null
  }] as APIEmbed[] })
}

export const cmd = {
  name: "fun",
  description: "Random fun commands",
  options: [
    {
      name: "achievement",
      description: "Make your own Minecraft achievement",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "icon",
          description: "The icon of the achievement",
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
          required: true
        },
        {
          name: "content",
          description: "The content of the achievement",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "title",
          description: "The title of the achievement",
          type: ApplicationCommandOptionType.String,
          required: false
        }
      ]
    },
    {
      name: "facts",
      description: "Get a random fact",
      type: ApplicationCommandOptionType.Subcommand
    },
    {
      name: "format",
      description: "Reformat your text to any style from the list",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "style",
          description: "The style of the text",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "vArIeD cAsE", value: "varied" },
            { name: "s?????????? ?????????s", value: "smallcaps" },
            { name: "??????????? ????????????????????????????? (tiny superscript)", value: "superscript" },
            { name: "u??op??p???sdn (upsidedown)", value: "upsidedown" },
            { name: "??????????????????????????? (fullwidth)", value: "fullwidth" },
            { name: "1337 (leet)", value: "leet" },
            { name: "???????????????????????? (japanese)", value: "japanese" }
          ],
          required: true,
        },
        {
          name: "text",
          description: "The text to be formatted [string]",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    },
    {
      name: "meme",
      description: "Make your own meme",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "text",
          description: "The meme's caption",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "variant",
          description: "The meme's variant (leave blank for random)",
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
          required: false
        },
        {
          name: "custom_image",
          description: "Custom image (overrides variant)",
          type: ApplicationCommandOptionType.Attachment,
          required: false
        }
      ]
    },
    {
      name: "wordle",
      description: "Play a game of Wordle!",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "daily",
          description: "Play today's word from Wordle",
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: "replay",
          description: "Replay a game of Worlde",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "id",
              description: "The ID of the game to replay [integer 0~2308]",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 0,
              max_value: 2308
            }
          ]
        },
        {
          name: "random",
          description: "Play any random word",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "mode",
              description: "The random mode to play",
              type: ApplicationCommandOptionType.String,
              required: true,
              choices: [
                { name: "Random Words", value: "random" },
                { name: "Random Daily Wordle", value: "daily" },
              ]
            }
          ]
        },
      ]
    },
  ]
}

export async function execute(interaction: ChatInputCommandInteraction) {
  switch(interaction.options.getSubcommandGroup()) {
    case "wordle": {
      var title = `${interaction.user.tag} | `
      let answer: string | undefined

      switch (interaction.options.getSubcommand()) {
        case "daily": {
          [answer, title] = [wordle.getWord(), `${title}Daily Wordle`]
          break
        }

        case "replay": {
          const id = interaction.options.getInteger("id") as number;
          [answer, title] = [wordle.answers[id], `${title}Wordle #${id}`]
          break
        }

        case "random": {
          const mode = interaction.options.getString("mode")
          title += "Random Wordle"
          answer = mode == "random"
            ? pickFromArray(wordle.allowed)
            : pickFromArray(wordle.answers)
          break
        }
      }

      const embed = {
        title,
        image: { url: "attachment://wordle.png" },
        footer: { text: "6 guesses remaining" },
        timestamp: Temporal.Now.instant().toString(),
      }

      const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [{
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Primary,
            label: "Guess",
            custom_id: `wordle_${(answer as string).toUpperCase()}__`
          },
          {
            type: ComponentType.Button,
            style: ButtonStyle.Danger,
            label: "Give Up",
            custom_id: `wordle_${(answer as string).toUpperCase()}_giveup`
          }
        ]
      }]

      const attachment = new MessageAttachment("./Resources/Wordle/WordleBase.png", "wordle.png")
      await interaction.reply({ embeds: [embed], components, files: [attachment] })
      break
    }

    default: {
      switch (interaction.options.getSubcommand()) {
        case "achievement": {
          const titles = ["Achievement Get!", "Advancement Made!", "Goal Reached!", "Challenge Complete!"]
          const content = interaction.options.getString("content") as string
          const icon = interaction.options.getString("icon") != "0" ? interaction.options.getString("icon") : randRange(39)
          const title = interaction.options.getString("title") != null ? interaction.options.getString("title") : pickFromArray(titles)

          await interaction.reply({ embeds: [{
            color: parseInt(pickFromArray(colors), 16),
            image: { url: `https://minecraftskinstealer.com/achievement/${icon}/${encodeURI(title)}/${encodeURI(content)}` }
          }] })
          break
        }

        case "facts": {
          const facts = [
            "The chicken came first or the egg? The answer is... `the chicken`",
            "The alphabet is completely random",
            "I ran out of facts. That's a fact",
            "Found this fact? You're lucky!",
            "There are 168 prime numbers between 1 and 1000",
            "`??` is just `??` times two!",
            "`??` is `tau` and `??` is `pi`!",
            "The F word is the most flexible word in English!",
            "`Homosapiens` are how biologists call humans!",
            "`Endy` is a cool bot! And that's a fact!",
            "`Long` is short and `short` is long!",
            "???-1 love you!",
            "There are 13 Slavic countries in the world -- Brought to you by your gopnik friend!",
            "There are plagues in 1620, 1720, 1820, 1920 and...",
            "The phrase: `The quick brown fox jumps over the lazy dog` contains every letter in the alphabet!",
            "There are no Nobel prizes for math because Nobel lost his love to a mathematician",
            "Endy is intellegent",
            "69 is just a normal number ok?",
            "There are 24 synthetic elements from 95~118",
            "Most of these facts are written by Adnagaporp#1965"
          ]

          await interaction.reply({ embeds: [{
            title: "Fact of the second...",
            color: parseInt(pickFromArray(colors), 16),
            description: pickFromArray(facts),
          }] as APIEmbed[] })
          break
        }

        case "format": {
          const style = interaction.options.getString("style")
          const text = interaction.options.getString("text") as string
          const replacements = {
            og: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????[\\]^_`abcdefghijklmnopqrstuvwxyz?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????{|}",
            sc: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????[\\]^_`?????????????????????????????????????????????s????????????x??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????{|}",
            ss: " !\"#$%&'??????*???,???./???????????????????????????:;<???>?@????????????????????????????????????????????????Q????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????[\\]^_`???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????{|}",
            ud: " ??\"#$%???,)(*+'-??/0????????????9???86:;>=<??@???q??p???????HI??????WNO??Q??S????????MX??Z?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????]\\[^???,??q??p???????????????l??uodb??s??n????x??z?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????}|{",
            fw: "????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????",
            lt: " !\"#$%&'()*+,-./0123456789:;<=>?@48CD3FG#IJK1MN0PQ??57UVWXY2?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????[\\]^_`48cd3fg#ijk1mn0pq??57uvwxy2?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????{|}",
            jp: "???!\"#$%&'()*+,-./0123456789:;<=>?@???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????[\\]^_`???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????{|}"
          }

          let replace: string | undefined
          let result = ""

          switch(style) {
            case "varied": {
              let turn = false
              for (let i = 0; i < text.length; i++) {
                if (text[i] != " ") {
                  result += (turn ? i % 2 == 0 : i % 2 != 0) ? text[i].toUpperCase() : text[i].toLowerCase()
                  continue
                }
                result += " "
                turn = !turn
              }
              return await interaction.reply({ content: `**Original:** ${text}\n**Converted:** ${result}`, ephemeral: true })
            }

            case "smallcaps": {
              replace = replacements.sc
              break
            }

            case "superscript": {
              replace = replacements.ss
              break
            }

            case "upsidedown": {
              replace = replacements.ud
              break
            }

            case "fullwidth": {
              replace = replacements.fw
              break
            }

            case "leet": {
              replace = replacements.lt
              break
            }

            case "japanese": {
              replace = replacements.jp
              break
            }
          }

          for (let i = 0; i < text.length; i++) {
            result += (replace as string).charAt(replacements.og.indexOf(text[i]))
          }

          await interaction.reply({ content: `**Original:** ${text}\n**Converted:** ${result}`, ephemeral: true })
          break
        }

        case "meme": {
          await interaction.deferReply()

          const separator = "????"
          let img: string | Buffer

          const text = interaction.options.getString("text") as string
          const image = interaction.options.getAttachment("custom_image")
          const variants = fs.readdirSync("./Resources/Meme/").filter((file) => file.endsWith(".png"))
          const variant = interaction.options.getString("variant")?.replaceAll(" ", "_") || pickFromArray(variants).slice(0, -4)

          if (image) {
            const response = await axios.get(image.url, { responseType: "arraybuffer" })
            img = Buffer.from(response.data, "utf-8")
          } else {
            img = `./Resources/Meme/${variant}.png`
          }
          const offset = 0.4
          const dimensions = imageSize(img) as { width: number, height: number }
          const height = (dimensions.height > 250 ? dimensions.height : 250) as number
          const width = height / dimensions.height * dimensions.width

          let canvas = new Canvas(width, height * (1 + offset))

          if (variant == "panik_kalm_panik") {
            canvas = new Canvas(width, height)
            const ctx = getCtx(canvas)

            const bg = await loadImage(img)
            ctx.drawImage(bg, 0, 0, width, height)

            const texts = text.split(separator)
            texts.forEach((text, ind) => {
              const fontSize = getFontSize(text, width, height)
              ctx.font = `normal ${fontSize}px/${fontSize * (1 + offset / 2)}px LeagueSpartan`
              ctx.fillText(text, width / 4, getMidY(ctx, text, width / 2, height / 3) + height / 3 * ind, width * 0.45)
            })

            await sendMeme(interaction, canvas, variant, text, separator)
          } else {
            const ctx = getCtx(canvas)

            const bg = await loadImage(img)
            ctx.drawImage(bg, 0, height * offset, width, height)

            ctx.fillStyle = "#fff"
            ctx.fillRect(0, 0, width, height * offset)

            ctx.fillStyle = "#000"
            const fontSize = getFontSize(text, width, height)
            ctx.font = `normal ${fontSize}px/${fontSize * (1 + offset / 2)}px LeagueSpartan`
            ctx.fillText(text, width / 2, getMidY(ctx, text, width, height * offset), width)
            await sendMeme(interaction, canvas, variant as string, text, separator)
          }
          break
        }
      }
    }
  }
}

export async function button(interaction: ButtonInteraction) {
  if (interaction.customId.startsWith("wordle")) {
    const embed = new EmbedBuilder((interaction.message.embeds[0] as Embed).data).toJSON()

    if (!embed.title?.includes(interaction.user.tag)) return interaction.reply({ content: "You can't sabotage another player's Wordle session", ephemeral: true })
    if (interaction.customId.endsWith("giveup")) {
      return await interaction.update({ content: `**${interaction.user.tag} Gave Up!**\n**Answer:** ${interaction.customId.slice(7, 12)}`, components: [], embeds: [] })
    }

    await interaction.showModal({
      title: "Wordle",
      custom_id: "wordle",
      components: [{
        type: ComponentType.ActionRow,
        components: [{
          type: ComponentType.TextInput,
          custom_id: "guess",
          label: "Your Guess",
          style: TextInputStyle.Short,
          min_length: 5,
          max_length: 5,
          required: true
        }]
      }]
    })
  }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const fs = await import("fs")
  let choices: { name: string, value: string }[] = []
  switch (interaction.options.getSubcommand()) {
    case "meme":
    case "meme-skia": {
      const memeFiles = fs.readdirSync("./Resources/Meme/").filter((file: string) => file.endsWith(".png"))
      memeFiles.forEach((file: string) => {
        choices.push({ name: file.split(".")[0].replaceAll("_", " "), value: file.split(".")[0] })
      })
      break
    }

    case "achievement": {
      choices = [
        { name: "arrow",            value: "34" },
        { name: "bed",              value: "9"  },
        { name: "cake",             value: "10" },
        { name: "cobweb",           value: "16" },
        { name: "crafting_table",   value: "13" },
        { name: "creeper",          value: "4"  },
        { name: "diamond",          value: "2"  },
        { name: "diamond_sword",    value: "3"  },
        { name: "arrow",            value: "34" },
        { name: "book",             value: "19" },
        { name: "bow",              value: "33" },
        { name: "bucket",           value: "36" },
        { name: "chest",            value: "17" },
        { name: "coal_block",       value: "31" },
        { name: "cookie",           value: "7"  },
        { name: "diamond_armor",    value: "26" },
        { name: "fire",             value: "15" },
        { name: "flint_and_steel",  value: "27" },
        { name: "furnace",          value: "18" },
        { name: "gold_ingot",       value: "23" },
        { name: "grass_block",      value: "1"  },
        { name: "heart",            value: "8"  },
        { name: "iron_armor",       value: "35" },
        { name: "iron_door",        value: "25" },
        { name: "iron_ingot",       value: "22" },
        { name: "iron_sword",       value: "32" },
        { name: "lava",             value: "38" },
        { name: "milk",             value: "39" },
        { name: "oak_door",         value: "24" },
        { name: "pig",              value: "5"  },
        { name: "planks",           value: "21" },
        { name: "potion",           value: "28" },
        { name: "rail",             value: "12" },
        { name: "redstone",         value: "14" },
        { name: "sign",             value: "11" },
        { name: "spawn_egg",        value: "30" },
        { name: "splash",           value: "29" },
        { name: "stone",            value: "20" },
        { name: "tnt",              value: "6"  },
        { name: "water",            value: "37" },
      ]
      break
    }
  }

  var res: { name: string, value: string }[] = []
  const pattern = interaction.options.getFocused() as string
  const fuse = new Fuse(choices, { distance: 25, keys: ["name", "value"] })

  if (pattern.length > 0) {fuse.search(pattern).forEach((choice: { item: { name: string; value: string } }) => res.push(choice.item))}
  else {
    for (let i = 0; i < choices.length; i++) {
      if (i > 24) break
      res.push(choices[i])
    }
  }

  await interaction.respond(res)
    .catch((err) => {console.error(err)})
}

export async function modal(interaction: ModalMessageModalSubmitInteraction) {
  const [guess, answer] = [interaction.fields.getTextInputValue("guess").toUpperCase(), (interaction.message?.components as ActionRow<MessageActionRowComponent>[])[0].components[0].customId?.slice(7, 12) as string]
  if (guess.length != 5) return interaction.reply({ content: "Invalid word length!", ephemeral: true })
  if (!wordle.allowed.includes(guess.toLowerCase())) return interaction.reply({ content: `${guess} is not a valid word!`, ephemeral: true })

  const [embed, ansArray] = [new EmbedBuilder((interaction.message?.embeds[0] as Embed).data).toJSON(), answer.split("")]
  const { width, height, space, side, keyFont, tileFont, tileStartingX, tileStartingY, keyWidth, keyStartingY, keys } = wordle.canvas

  let buttonID = (interaction.message?.components as ActionRow<MessageActionRowComponent>[])[0].components[0].customId as string
  if (buttonID == `wordle_${answer}`) {buttonID = `wordle_${answer}__`}
  const buttonIDs = buttonID.split("_") as string[]

  const canvas = new Canvas(width, height)
  const ctx = getCtx(canvas)
  ctx.font = `normal ${tileFont}px ClearSans`

  const img = await loadImage(embed.image?.url as string)
  ctx.drawImage(img, 0, 0, width, height)

  const guessCount = Math.abs(parseInt(embed.footer?.text.charAt(0) as string) - 7)
  for (let i = 0; i < 5; i++) {
    if (guess[i] == answer[i] && ansArray.includes(guess[i])) {
      ctx.fillStyle = wordle.colors.correct
      ansArray.splice(ansArray.indexOf(guess[i]), 1)
      if (!buttonIDs[2].includes(guess[i])) {buttonIDs[2] += guess[i]}
      buttonIDs[3].replaceAll(guess[i], "")
    } else if (answer.includes(guess[i]) && ansArray.includes(guess[i])) {
      ctx.fillStyle = wordle.colors.present
      ansArray.splice(ansArray.indexOf(guess[i]), 1)
      if (!buttonIDs[2].includes(guess[i]) && !buttonIDs[3].includes(guess[i])) {buttonIDs[3] += guess[i]}
    } else {
      ctx.fillStyle = wordle.colors.absent
    }

    const tileX = tileStartingX + i * (side + space)
    const tileY = tileStartingY + (guessCount - 1) * (side + space)

    ctx.fillRect(tileX, tileY, side, side)

    if (ctx.fillStyle != wordle.colors.present && buttonIDs[3].includes(guess[i])) ctx.fillStyle = wordle.colors.present
    if (ctx.fillStyle != wordle.colors.correct && buttonIDs[2].includes(guess[i])) ctx.fillStyle = wordle.colors.correct

    let x: number | undefined
    var y = keys.findIndex((keyRow) => {
      x = keyRow.indexOf(guess[i])
      return x != -1
    })

    const keyStartingX = (width - (keyWidth * keys[y].length + space * (keys[y].length - 1)))/2
    const keyX = keyStartingX + (x as number) * (keyWidth + space)
    const keyY = keyStartingY + y * (side + space)

    ctx.fillRect(keyX, keyY, keyWidth, side)

    ctx.fillStyle = wordle.colors.text
    ctx.font = ctx.font = `normal ${tileFont}px ClearSans`
    ctx.fillText(guess[i], tileX + side / 2, tileY - tileFont / 8 + getMidY(ctx, guess[i], side, side))
    ctx.font = ctx.font = `normal ${keyFont}px ClearSans`
    ctx.fillText(guess[i], keyX + keyWidth / 2, keyY + getMidY(ctx, guess[i], keyWidth, side), keyWidth)
  }

  embed.footer = { text: `${6 - guessCount}${embed.footer?.text.slice(1)}` }
  embed.image = { url: `attachment://wordle${guessCount}.png` }
  const attachment = new MessageAttachment(await canvas.png, `wordle${guessCount}.png`)

  const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [{
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        label: "Guess",
        custom_id: String(buttonIDs.join("_"))
      },
      {
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        label: "Give Up",
        custom_id: "wordle_giveup"
      }
    ]
  }]

  if (guess == answer) {
    embed.title += " - You Won!"
  } else if (embed.footer.text.charAt(0) == "0") {
    embed.title += " - You Lost :("
    embed.footer = { text: `Answer: ${answer}` }
  } else {
    return await interaction.update({ components: components, embeds: [embed], files: [attachment] })
  }
  await interaction.update({ components: [], embeds: [embed], files: [attachment] })
}
