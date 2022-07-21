import { ApplicationCommandOptionChoice, ApplicationCommandOptionTypes, Bot, CreateApplicationCommand, Interaction } from "discordeno"
import Fuse from "fuse"
import { colors, error, getFiles, getFocused, getSubcmd, getSubcmdGroup, getValue, pickFromArray, randRange, respond } from "modules"

export const cmd: CreateApplicationCommand = {
  name: "fun",
  description: "Random fun commands",
  defaultMemberPermissions: ["USE_SLASH_COMMANDS"],
  options: [
    {
      name: "8ball",
      description: "Get a response from the magic 8-Ball",
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [{
        name: "question",
        description: "The question to ask [String]",
        type: ApplicationCommandOptionTypes.String,
        required: true,
      }],
    },
    {
      name: "achievement",
      description: "Make your own Minecraft achievement",
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: "icon",
          description: "The icon of the achievement",
          type: ApplicationCommandOptionTypes.String,
          autocomplete: true,
          required: true,
        },
        {
          name: "content",
          description: "The content of the achievement",
          type: ApplicationCommandOptionTypes.String,
          required: true,
        },
        {
          name: "title",
          description: "The title of the achievement",
          type: ApplicationCommandOptionTypes.String,
          required: false,
        },
      ],
    },
    {
      name: "format",
      description: "Reformat your text to any style from the list",
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: "style",
          description: "The style of the text",
          type: ApplicationCommandOptionTypes.String,
          choices: [
            { name: "vArIeD cAsE", value: "varied" },
            { name: "sᴍᴀʟʟ ᴄᴀᴘs", value: "smallcaps" },
            { name: "ᵗᶦⁿʸ ˢᵘᵖᵉʳˢᶜʳᶦᵖᵗ (tiny superscript)", value: "superscript" },
            { name: "uʍopǝpᴉsdn (upsidedown)", value: "upsidedown" },
            { name: "ｆｕｌｌｗｉｄｔｈ (fullwidth)", value: "fullwidth" },
            { name: "1337 (leet)", value: "leet" },
            { name: "丁卂尸卂ん乇丂乇 (japanese)", value: "japanese" },
          ],
          required: true,
        },
        {
          name: "text",
          description: "The text to be formatted [String]",
          type: ApplicationCommandOptionTypes.String,
          required: true,
        },
      ],
    },
    {
      name: "meme",
      description: "Make your own meme",
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: "text",
          description: "The meme's caption",
          type: ApplicationCommandOptionTypes.String,
          required: true,
        },
        {
          name: "variant",
          description: "The meme's variant (leave blank for random)",
          type: ApplicationCommandOptionTypes.String,
          autocomplete: true,
          required: false,
        },
        {
          name: "custom_image",
          description: "Custom image (overrides variant)",
          type: ApplicationCommandOptionTypes.Attachment,
          required: false,
        },
      ],
    },
    {
      name: "wordle",
      description: "Play a game of Wordle!",
      type: ApplicationCommandOptionTypes.SubCommandGroup,
      options: [
        {
          name: "daily",
          description: "Play today's word from Wordle",
          type: ApplicationCommandOptionTypes.SubCommand,
        },
        {
          name: "replay",
          description: "Replay a game of Worlde",
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: "id",
              description: "The ID of the game to replay [Integer 0~2308]",
              type: ApplicationCommandOptionTypes.Integer,
              required: true,
              minValue: 0,
              maxValue: 2308,
            },
          ],
        },
        {
          name: "random",
          description: "Play any random word",
          type: ApplicationCommandOptionTypes.SubCommand,
          options: [
            {
              name: "mode",
              description: "The random mode to play",
              type: ApplicationCommandOptionTypes.String,
              required: true,
              choices: [
                { name: "Random Words", value: "random" },
                { name: "Random Daily Wordle", value: "daily" },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export async function execute(bot: Bot, interaction: Interaction) {
  switch (getSubcmdGroup(interaction)) {
    default: {
      switch (getSubcmd(interaction)) {
        case "8ball": {
          const responses = {
            yes: [
              "It's certain.",
              "It's decidedly so.",
              "Without a doubt.",
              "Yes, definitely.",
              "You may rely on it.",
              "As i see it, yes.",
              "Most likely.",
              "Outlook good.",
              "Yes.",
              "Signs point to Yes.",
            ],
            neutral: [
              "Reply hazy, try again.",
              "Ask again later.",
              "Better not tell you now.",
              "Can't predict now",
              "Concentrate and ask again",
            ],
            no: [
              "Don't count on it.",
              "My reply is no.",
              "My sources say no.",
              "Outlook not so good.",
              "Very doubtful",
            ],
          }

          const index = Math.floor(Math.random() * 300) % 3
          const question = getValue(interaction, "question", "String") ?? ""
          const response = question.endsWith("\u200a") || question.startsWith("\u200a")
            ? pickFromArray(responses.yes)
            : question.endsWith("\u200b") || question.startsWith("\u200b")
            ? pickFromArray(responses.no)
            : pickFromArray(responses[Object.keys(responses)[index]])

          await respond(bot, interaction, {
            embeds: [{
              title: "Magic 8-Ball",
              color: parseInt(pickFromArray(colors), 16),
              fields: [
                { name: ":question: Question", value: question, inline: false },
                { name: ":8ball: Response", value: response, inline: false },
              ],
            }],
          })
          break
        }

        case "achievement": {
          const titles = ["Achievement Get!", "Advancement Made!", "Goal Reached!", "Challenge Complete!"]
          const content = getValue(interaction, "content", "String") ?? "I am blank"
          const icon = parseInt(getValue(interaction, "icon", "String") ?? "0") || randRange(39)
          const title = getValue(interaction, "title", "String") ?? pickFromArray(titles)

          await respond(bot, interaction, {
            embeds: [{
              color: parseInt(pickFromArray(colors), 16),
              image: { url: `https://minecraftskinstealer.com/achievement/${icon}/${encodeURI(title)}/${encodeURI(content)}` },
            }],
          })
          break
        }

        case "format": {
          const style = getValue(interaction, "style", "String") ?? "og"
          const text = getValue(interaction, "text", "String") ?? ""

          const replacements = {
            og: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`abcdefghijklmnopqrstuvwxyzáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}",
            smallcaps: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}",
            superscript: " !\"#$%&'⁽⁾*⁺,⁻./⁰¹²³⁴⁵⁶⁷⁸⁹:;<⁼>?@ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁνᵂˣʸᶻÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}",
            upsidedown: " ¡\"#$%℘,)(*+'-˙/0ƖᄅƐㄣϛ9ㄥ86:;>=<¿@∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMXλZÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ]\\[^‾,ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎzáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ}|{",
            fullwidth: "　！＂＃＄％＆＇（）＊＋，－．／０１２３４５６７８９：；＜＝＞？＠ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ［＼］＾＿｀ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ｛｜｝",
            leet: " !\"#$%&'()*+,-./0123456789:;<=>?@48CD3FG#IJK1MN0PQЯ57UVWXY2ÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`48cd3fg#ijk1mn0pqЯ57uvwxy2áàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}",
            japanese: "　!\"#$%&'()*+,-./0123456789:;<=>?@卂乃匚刀乇下厶卄工丁长乚从ん口尸㔿尺丂丅凵リ山乂丫乙ÁÀẢÃẠÉÈẺẼẸÍÌỈĨỊÓÒỎÕỌÚÙỦŨỤẮẰẲẴẶẤẦẨẪẬẾỀỂỄỆỐỒỔỖỘỚỜỞỠỢỨỪỬỮỰÝỲỶỸỴ[\\]^_`卂乃匚刀乇下厶卄工丁长乚从ん口尸㔿尺丂丅凵リ山乂丫乙áàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụắằẳẵặấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵ{|}",
          }

          let replace = ""
          let result = ""

          switch (style) {
            case "varied": {
              let turn = false
              for (let i = 0; i < text.length; i++) {
                if (text[i] != " ") {
                  result += turn && i % 2 == 0 ? text[i].toUpperCase() : text[i].toLowerCase()
                  continue
                }
                result += " "
                turn = !turn
              }
              return await respond(bot, interaction, `**Original:** ${text}\n**Converted:** ${result}`, true)
            }

            default: {
              replace = replacements[style]
              break
            }
          }

          for (let i = 0; i < text.length; i++) {
            result += replace.charAt(replacements.og.indexOf(text[i]))
          }

          await respond(bot, interaction, `**Original:** ${text}\n**Converted:** ${result}`, true)
          break
        }
      }
    }
  }
}

export async function autocomplete(bot: Bot, interaction: Interaction) {
  const current = getFocused(interaction) ?? ""
  const choices: ApplicationCommandOptionChoice[] = []

  switch (getSubcmd(interaction)) {
    case "meme": {
      const memeFiles = getFiles("./Resources/Meme/").filter((file: string) => file.endsWith(".png"))
      choices.push(...memeFiles.map(file => ({ name: file.split(".")[0].replaceAll("_", " "), value: file.split(".")[0] })))
      break
    }

    case "achievement": {
      choices.push(
        { name: "arrow", value: "34" },
        { name: "bed", value: "9" },
        { name: "cake", value: "10" },
        { name: "cobweb", value: "16" },
        { name: "crafting_table", value: "13" },
        { name: "creeper", value: "4" },
        { name: "diamond", value: "2" },
        { name: "diamond_sword", value: "3" },
        { name: "arrow", value: "34" },
        { name: "book", value: "19" },
        { name: "bow", value: "33" },
        { name: "bucket", value: "36" },
        { name: "chest", value: "17" },
        { name: "coal_block", value: "31" },
        { name: "cookie", value: "7" },
        { name: "diamond_armor", value: "26" },
        { name: "fire", value: "15" },
        { name: "flint_and_steel", value: "27" },
        { name: "furnace", value: "18" },
        { name: "gold_ingot", value: "23" },
        { name: "grass_block", value: "1" },
        { name: "heart", value: "8" },
        { name: "iron_armor", value: "35" },
        { name: "iron_door", value: "25" },
        { name: "iron_ingot", value: "22" },
        { name: "iron_sword", value: "32" },
        { name: "lava", value: "38" },
        { name: "milk", value: "39" },
        { name: "oak_door", value: "24" },
        { name: "pig", value: "5" },
        { name: "planks", value: "21" },
        { name: "potion", value: "28" },
        { name: "rail", value: "12" },
        { name: "redstone", value: "14" },
        { name: "sign", value: "11" },
        { name: "spawn_egg", value: "30" },
        { name: "splash", value: "29" },
        { name: "stone", value: "20" },
        { name: "tnt", value: "6" },
        { name: "water", value: "37" },
      )
      break
    }
  }

  const response: ApplicationCommandOptionChoice[] = []
  const fuse = new Fuse(choices, { distance: 5, keys: ["name", "value"] })
  if (current.length > 0) response.push(...fuse.search(current).map(choice => choice.item))
  else response.push(...choices)

  await respond(bot, interaction, { choices: response.slice(0, 25) }).catch(err => error(bot, interaction, err, "Autocomplete"))
}
