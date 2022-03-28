import axios from "axios"
import Fuse from "fuse.js"
import { colors, random } from "../modules"
import { UnsafeEmbedBuilder } from "@discordjs/builders"
import { APIActionRowComponent, APIEmbed, APIMessageActionRowComponent } from "discord-api-types/v10"
import { ActionRow, ApplicationCommandOptionType, AutocompleteInteraction, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, Embed, MessageActionRowComponent, MessageAttachment, ModalMessageModalSubmitInteraction, TextInputStyle } from "discord.js"
// #region Canvas Related Stuff
import fs from "fs"
import Canvas from "canvas"
import { imageSize } from "image-size"
import canvasTxt from "canvas-txt"
import wordle from "../Resources/Wordle"
Canvas.registerFont("./Resources/Wordle/ClearSans-Bold.ttf", { family: "ClearSans" })
Canvas.registerFont("./Resources/Meme/LeagueSpartan-Regular.ttf", { family: "LeagueSpartan" })
// #endregion

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
            { name: "sᴍᴀʟʟ ᴄᴀᴘs", value: "smallcaps" },
            { name: "ᵗᶦⁿʸ ˢᵘᵖᵉʳˢᶜʳᶦᵖᵗ (tiny superscript)", value: "superscript" },
            { name: "uʍopǝpᴉsdn (upsidedown)", value: "upsidedown" },
            { name: "ｆｕｌｌｗｉｄｔｈ (fullwidth)", value: "fullwidth" },
            { name: "1337 (leet)", value: "leet" },
            { name: "丁卂尸卂ん乇丂乇 (japanese)", value: "japanese" }
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
          description: "The text to make the meme",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "variant",
          description: "The variant of the meme to use (leave blank for random)",
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
          required: false
        },
        {
          name: "custom_image",
          description: "Make a meme the uploaded image (overrides variant)",
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
      const { width, height, space, size, tileStartingX, tileStartingY, keyWidth, keyStartingY, keys } = wordle.canvas

      const canvas = Canvas.createCanvas(width, height)
      const ctx = canvas.getContext("2d")
      canvasTxt.font = "ClearSans"
      canvasTxt.fontSize = wordle.canvas.keyFont

      ctx.fillStyle = wordle.colors.background
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = wordle.colors.tilebg
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 5; x++) {
          ctx.fillRect(tileStartingX + x * (size + space), tileStartingY + y * (size + space), size, size)
        }
      }

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < keys[y].length; x++) {
          ctx.fillStyle = wordle.colors.keybg
          const keyStartingX = (width - (keyWidth * keys[y].length + space * (keys[y].length - 1)))/2
          const keyX = keyStartingX + x * (keyWidth + space)
          const keyY = keyStartingY + y * (size + space)
          ctx.fillRect(keyX, keyY, keyWidth, size)

          ctx.fillStyle = wordle.colors.text
          canvasTxt.drawText(ctx, keys[y][x], keyX, keyY, keyWidth, size - canvasTxt.fontSize / 3)
        }
      }

      let title: string | undefined, answer: string | undefined

      switch (interaction.options.getSubcommand()) {
        case "daily": {
          answer = wordle.getWord()
          title = "Daily Wordle"
          break
        }

        case "replay": {
          const id = interaction.options.getInteger("id") as number
          answer = wordle.answers[id]
          title = `Wordle #${id}`
          break
        }

        case "random": {
          const mode = interaction.options.getString("mode")
          if (mode == "random") {
            answer = random.pickFromArray(wordle.allowed)
            title = "Random Wordle"
          } else if (mode == "daily") {
            answer = random.pickFromArray(wordle.answers)
            title = "Random Daily Wordle"
          }
          break
        }
      }

      const embed = {
        title: title,
        image: { url: "attachment://wordle.png" },
        author: { name: interaction.user.tag, iconURL: interaction.user.avatarURL() },
        footer: { text: "6 guesses remaining" },
        timestamp: new Date().toISOString(),
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
            custom_id: "wordle_giveup"
          }
        ]
      }]

      const attachment = new MessageAttachment(canvas.toBuffer(), "wordle.png")
      await interaction.reply({ embeds: [embed], components: components, files: [attachment] })
      break
    }

    default: {
      switch (interaction.options.getSubcommand()) {
        case "achievement": {
          var titles = ["Achievement Get!", "Advancement Made!", "Goal Reached!", "Challenge Complete!"]

          const content = interaction.options.getString("content") as string
          const icon = interaction.options.getString("icon") != "0" ? interaction.options.getString("icon") : Math.floor(Math.random() * 39)
          const title = interaction.options.getString("title") != null ? interaction.options.getString("title") : random.pickFromArray(titles)

          await interaction.reply({ embeds: [{
            color: parseInt(random.pickFromArray(colors), 16),
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
            "`τ` is just `π` times two!",
            "`τ` is `tau` and `π` is `pi`!",
            "The F word is the most flexible word in English!",
            "`Homosapiens` are how biologists call humans!",
            "`Endy` is a cool bot! And that's a fact!",
            "`Long` is short and `short` is long!",
            "√-1 love you!",
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
            title: "Facts",
            color: parseInt(random.pickFromArray(colors), 16),
            description: "Fresh out of the oven.",
            fields: [{ name: "The fact of the second is...", value: random.pickFromArray(facts), inline: false }],
            author: { name: `${interaction.user.username}#${interaction.user.discriminator}`, icon_url: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` },
            footer: { text: `${interaction.client.user?.username}#${interaction.client.user?.discriminator}`, icon_url: `https://cdn.discordapp.com/avatars/${interaction.client.user?.id}/${interaction.client.user?.avatar}.png` }
          }] as APIEmbed[] })
          break
        }

        case "format": {
          const style = interaction.options.getString("style")
          const text = interaction.options.getString("text") as string
          const replacements = {
            og: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`abcdefghijklmnopqrstuvwxyzáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}",
            sc: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}",
            ss: " !\"#$%&'⁽⁾*⁺,⁻./⁰¹²³⁴⁵⁶⁷⁸⁹:;<⁼>?@ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁνᵂˣʸᶻÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}",
            ud: " ¡\"#$%℘,)(*+'-˙/0ƖᄅƐㄣϛ9ㄥ86:;>=<¿@∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMXλZÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ]\\[^‾,ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎzáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ}|{",
            fw: "　！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ［＼］＾＿｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ｛｜｝",
            lt: " !\"#$%&'()*+,-./0123456789:;<=>?@48CD3FG#IJK1MN0PQЯ57UVWXY2ÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`48cd3fg#ijk1mn0pqЯ57uvwxy2áàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}",
            jp: "　!\"#$%&'()*+,-./0123456789:;<=>?@卂乃匚刀乇下厶卄工丁长乚从ん口尸㔿尺丂丅凵リ山乂丫乙ÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`卂乃匚刀乇下厶卄工丁长乚从ん口尸㔿尺丂丅凵リ山乂丫乙áàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}"
          }

          let replace: string | undefined
          let result = ""

          switch(style) {
            case "varied": {
              let turn = false
              for (let i = 0; i < text.length; i++) {
                if (text[i] == " ") {
                  result += " "
                  turn = !turn
                } else {
                  const cond = turn ? i % 2 == 0 : i % 2 != 0
                  result += cond ? text[i].toUpperCase() : text[i].toLowerCase()
                }
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

          let canvas: Canvas.Canvas, img: string | Buffer// | string[]
          const separator = "§§"

          canvasTxt.font = "LeagueSpartan"
          const text = interaction.options.getString("text") as string
          const image = interaction.options.getAttachment("custom_image")
          const variants= fs.readdirSync("./Resources/Meme/").filter((file) => file.endsWith(".jpg"))
          const variant = interaction.options.getString("variant")

          if (image) {
            const response = await axios.get(image.url, { responseType: "arraybuffer" })
            img = Buffer.from(response.data, "utf-8")
          } else if (variant == "random" || variant == null) {
            img = `./Resources/Meme/${random.pickFromArray(variants)}`
          } else {
            img = `./Resources/Meme/${interaction.options.getString("variant")?.replaceAll(" ", "_")}.jpg`
          }

          const dimensions = imageSize(img) as { width: number, height: number }
          const height = (dimensions.height > 250 ? dimensions.width : 250) as number
          const width = height / dimensions.height * dimensions.width

          if (img == "panik_kalm_panik") {
            const texts = text.split(separator)
            canvas = Canvas.createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            const bg = await Canvas.loadImage(img)
            ctx.drawImage(bg, 0, 0, width, height)

            texts.forEach((text, ind) => {
              canvasTxt.fontSize = Math.min(height * 0.13, width * 0.09) * (0.975 ** Math.floor(text.length / 7.5))
              canvasTxt.drawText(ctx, text, 0, height / 3 * ind - (canvasTxt.fontSize / 2), width / 2, height / 3 + (canvasTxt.fontSize / 2))
            })
          } else {
            canvas = Canvas.createCanvas(width, height * 1.35)
            const ctx = canvas.getContext("2d")
            const offset = 0.4

            const bg = await Canvas.loadImage(img)
            ctx.drawImage(bg, 0, height * offset, width, height)

            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, width, height * offset)

            ctx.fillStyle = "#000000"
            canvasTxt.fontSize = Math.min(height * 0.13, width * 0.09) * (0.975 ** Math.floor(text.length / 7.5))
            canvasTxt.drawText(ctx, text, 0, -(canvasTxt.fontSize / 2), width, height * offset + (canvasTxt.fontSize / 2))
          }

          const attachment = new MessageAttachment(canvas.toBuffer(), "meme.jpg")
          await interaction.editReply({ files: [attachment], embeds: [{
            color: parseInt(random.pickFromArray(colors), 16),
            image: { url: "attachment://meme.jpg" },
            footer: img.includes("panik_kalm_panik") && text.split(separator).length < 3 ? { text: `Tip: Separate 3 texts with ${separator} to fill the whole template` } : null
          }] as APIEmbed[] })
          break
        }
      }
    }
  }
}

export async function button(interaction: ButtonInteraction) {
  if (interaction.customId.startsWith("wordle")) {
    const embed = new UnsafeEmbedBuilder((interaction.message.embeds[0] as Embed).data).toJSON()
    if (!embed.author?.name.includes(interaction.user.tag)) return interaction.reply({ content: "You can't sabotage another player's Wordle session", ephemeral: true })
    if (interaction.customId.endsWith("giveup")) {
      embed.title += " - You Gave Up"
      embed.footer = { text: `Answer: ${(interaction.message.components as ActionRow<MessageActionRowComponent>[])[0].components[0].customId?.slice(7, 12)}` }
      await interaction.update({ components: [], embeds: [embed as APIEmbed], files: [] })
    } else {
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
}
export async function autocomplete(interaction: AutocompleteInteraction) {
  const fs = await import("fs")
  let choices: { name: string, value: string }[] = []
  switch (interaction.options.getSubcommand()) {
    case "meme": {
      const choices: { name: string, value: string }[] = []
      const memeFiles = fs.readdirSync("./Resources/Meme/").filter((file: string) => file.endsWith(".jpg"))
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

  const res: { name: string, value: string }[] = []
  const pattern = interaction.options.getFocused() as string
  const fuse = new Fuse(choices, { distance: 25, keys: ["name", "value"] })

  if (pattern.length > 0) {fuse.search(pattern).forEach((choice: { item: { name: string; value: string } }) => res.push(choice.item))}
  else {
    for (let i = 0; i < choices.length; i++) {
      if (i > 23) break
      res.push(choices[i])
    }
  }

  interaction.respond(res)
}

export async function modal(interaction: ModalMessageModalSubmitInteraction) {
  const [guess, answer] = [interaction.fields.getTextInputValue("guess").toUpperCase(), (interaction.message?.components as ActionRow<MessageActionRowComponent>[])[0].components[0].customId?.slice(7, 12) as string]
  if (guess.length != 5) return interaction.reply({ content: "Invalid word length!", ephemeral: true })
  if (!wordle.allowed.includes(guess.toLowerCase())) return interaction.reply({ content: `${guess} is not a valid word!`, ephemeral: true })
  
  const { Image } = await import("canvas")

  const [embed, ansArray] = [new UnsafeEmbedBuilder((interaction.message?.embeds[0] as Embed).data).toJSON(), answer.split("")]
  const { width, height, space, size, tileStartingX, tileStartingY, keyWidth, keyStartingY, keys } = wordle.canvas

  let buttonID = (interaction.message?.components as ActionRow<MessageActionRowComponent>[])[0].components[0].customId as string
  if (buttonID == `wordle_${answer}`) {buttonID = `wordle_${answer}__`}
  const buttonIDs = buttonID.split("_") as string[]

  const canvas = Canvas.createCanvas(width, height)
  const ctx = canvas.getContext("2d")
  canvasTxt.font = "ClearSans"
  canvasTxt.fontSize = wordle.canvas.tileFont

  const img = new Image()
  const response = await axios.get(embed.image?.url as string, { responseType: "arraybuffer" })
  const imgWordle = Buffer.from(response.data, "utf-8")
  img.onload = () => ctx.drawImage(img, 0, 0, width, height)
  img.src = imgWordle

  const guessCount = Math.abs(parseInt(embed.footer?.text.charAt(0) as string) - 7)
  for (let i = 0; i < 5; i++) {
    canvasTxt.fontSize = wordle.canvas.tileFont
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

    const tileX = tileStartingX + i * (size + space)
    const tileY = tileStartingY + (guessCount - 1) * (size + space)

    ctx.fillRect(tileX, tileY, size, size)

    if (ctx.fillStyle != wordle.colors.present && buttonIDs[3].includes(guess[i])) ctx.fillStyle = wordle.colors.present
    if (ctx.fillStyle != wordle.colors.correct && buttonIDs[2].includes(guess[i])) ctx.fillStyle = wordle.colors.correct

    let x: number | undefined
    var y = keys.findIndex((keyRow) => {
      x = keyRow.indexOf(guess[i])
      return x != -1
    })

    const keyStartingX = (width - (keyWidth * keys[y].length + space * (keys[y].length - 1)))/2
    const keyX = keyStartingX + (x as number) * (keyWidth + space)
    const keyY = keyStartingY + y * (size + space)

    ctx.fillRect(keyX, keyY, keyWidth, size)

    ctx.fillStyle = wordle.colors.text
    canvasTxt.drawText(ctx, guess[i], tileX, tileY - canvasTxt.fontSize / 8, size, size)
    canvasTxt.fontSize = wordle.canvas.keyFont
    canvasTxt.drawText(ctx, guess[i], keyX, keyY, keyWidth, size - canvasTxt.fontSize / 3)
  }

  embed.footer = { text: `${6 - guessCount}${embed.footer?.text.slice(1)}` }
  embed.image = { url: `attachment://wordle${guessCount}.png` }
  const attachment = new MessageAttachment(canvas.toBuffer(), `wordle${guessCount}.png`)

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
  } else {
    return await interaction.update({ components: components, embeds: [embed], files: [attachment] })
  }
  embed.footer = { text: `Answer: ${answer}` }
  await interaction.update({ components: [], embeds: [embed], files: [attachment] })
}
