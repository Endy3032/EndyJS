import Fuse from "fuse.js"
import wikipedia from "wikipedia"
import urban from "urban-dictionary"
import { getLyrics } from "genius-lyrics-api"
import { Temporal } from "@js-temporal/polyfill"
import googtrans from "@vitalets/google-translate-api"
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import { existsSync, readFileSync, writeFile, writeFileSync } from "fs"
import { choices, CountryCovidCase, GlobalCovidCase } from "../Resources/Covid"
import { capitalize, colors, emojis, handleError, pickFromArray, TimeMetric } from "../Modules"
import { ApplicationCommandType, ApplicationCommandOptionType, ApplicationCommandOptionChoice, AutocompleteInteraction, ChatInputCommandInteraction, ComponentType, SelectMenuInteraction } from "discord.js"
import { APIActionRowComponent, APISelectMenuComponent } from "discord-api-types/v10"

const repCovid = async (interaction: ChatInputCommandInteraction, covCase: CountryCovidCase | GlobalCovidCase, msg = "") => {
  let timestamp: Temporal.Instant
  var title = `Covid Stats - Global ${msg.length > 0 ? `${msg}` : ""}`
  var fields = [
    { name: "Confirmed", value: `${covCase.totalConfirmed.toLocaleString("en")}`, inline: true },
    { name: "Deaths", value: `${covCase.totalDeaths.toLocaleString("en")}`, inline: true },
    { name: "Recovered", value: `${covCase.totalRecovered.toLocaleString("en")}`, inline: true },
  ]
  if (Object.keys(covCase).includes("country")) {
    covCase = covCase as CountryCovidCase
    title = title.replace("Global", `${covCase.country} [${covCase.countryCode}]`)
    fields.push(
      { name: "Daily Confirmed", value: `${covCase.dailyConfirmed.toLocaleString("en")}`, inline: true },
      { name: "Daily Deaths", value: `${covCase.dailyDeaths.toLocaleString("en")}`, inline: true },
      { name: "Active Cases", value: `${covCase.activeCases.toLocaleString("en")}`, inline: true },
      { name: "Confirmed/1M", value: `${covCase.totalConfirmedPerMillionPopulation.toLocaleString("en")}`, inline: true },
      { name: "Deaths/1M", value: `${covCase.totalDeathsPerMillionPopulation.toLocaleString("en")}`, inline: true },
      { name: "Critical", value: `${covCase.totalCritical.toLocaleString("en")}`, inline: true },
      { name: "Fatality Rate", value: `${covCase.FR}%`, inline: true },
      { name: "Recovery Rate", value: `${covCase.PR}%`, inline: true }
    )
    timestamp = Temporal.Instant.from(covCase.lastUpdated)
  } else {
    covCase = covCase as GlobalCovidCase
    fields.push(
      { name: "New Cases", value: `${covCase.totalNewCases.toLocaleString("en")}`, inline: true },
      { name: "New Deaths", value: `${covCase.totalNewDeaths.toLocaleString("en")}`, inline: true },
      { name: "New Active Cases", value: `${covCase.totalActiveCases.toLocaleString("en")}`, inline: true },
      { name: "Total Cases/1M", value: `${covCase.totalCasesPerMillionPop.toLocaleString("en")}`, inline: true },
    )
    timestamp = Temporal.Instant.from(covCase.created)
  }

  interaction.editReply({ embeds: [{
    title: title,
    color: parseInt(pickFromArray(colors), 16),
    fields: fields,
    footer: { text: "Last Updated" },
    timestamp: timestamp.toString(),
  }] })
}

export const cmd = {
  name: "fetch",
  description: "Fetches data from a source on the internet",
  type: ApplicationCommandType.ChatInput,
  options: [
    // #region crypto
    // {
    //   name: "crypto",
    //   description: "Gather details about cryptocurrencies",
    //   type: ApplicationCommandType.SubcommandGroup,
    //   options: [
    //     {
    //       name: "nomics",
    //       description: "Get data from Nomics",
    //       type: ApplicationCommandType.Subcommand,
    //       options: [
    //         {
    //           name: "currency",
    //           description: "The currency to get data for",
    //           type: ApplicationCommandType.String,
    //           autocomplete: true,
    //           required: true,
    //         }
    //       ]
    //     },
    //     {
    //       name: "coinmarketcap",
    //       description: "Get data from CoinMarketCap",
    //       type: ApplicationCommandType.Subcommand,
    //       options: [
    //         {
    //           name: "currency",
    //           description: "The currency to get data for",
    //           type: ApplicationCommandType.String,
    //           autocomplete: true,
    //           required: true,
    //         }
    //       ]
    //     },
    //     {
    //       name: "coingecko",
    //       description: "Get data from CoinGecko",
    //       type: ApplicationCommandType.Subcommand,
    //       options: [
    //         {
    //           name: "currency",
    //           description: "The currency to get data for",
    //           type: ApplicationCommandType.String,
    //           autocomplete: true,
    //           required: true,
    //         }
    //       ]
    //     },
    //   ]
    // },
    // #endregion
    {
      name: "covid",
      description: "Get data from the COVID-19 API",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "location",
        description: "The data's location",
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      }]
    },
    {
      name: "definition",
      description: "Fetch a definition from dictionaries",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "dictionary",
          description: "The dictionary to use",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "Dictionary API", value: "dictapi" },
            { name: "Urban Dictionary", value: "urban" },
          ],
          required: true,
        },
        {
          name: "word",
          description: "The word to fetch the definition",
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
          required: true,
        }
      ]
    },
    {
      name: "facts",
      description: "Get a fact from a magical place called the internet",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "date",
          description: "Get a fact about a date",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "day",
              description: "The date's day",
              type: ApplicationCommandOptionType.Integer,
              min_value: 1,
              max_value: 31,
              required: true,
            },
            {
              name: "month",
              description: "The date's month",
              type: ApplicationCommandOptionType.Integer,
              min_value: 1,
              max_value: 12,
              required: true,
            }
          ]
        },
        {
          name: "number",
          description: "Get a fact about a number",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "mode",
              description: "The fact's mode",
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: "Trivia", value: "trivia" },
                { name: "Math", value: "math" },
                { name: "Year", value: "year" },
              ],
              required: true,
            },
            {
              name: "number",
              description: "The fact's number",
              type: ApplicationCommandOptionType.Integer,
              required: true,
            }
          ]
        },
      ]
    },
    {
      name: "lyrics",
      description: "Fetch lyrics from Genius",
      type: ApplicationCommandOptionType.Subcommand,
      options: [{
        name: "song",
        description: "The song to search for",
        type: ApplicationCommandOptionType.String,
        autocomplete: true,
        required: true,
      }]
    },
    {
      name: "translation",
      description: "Fetch a translation from Google Translate",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "to",
          description: "The translated language",
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
          required: true,
        },
        {
          name: "text",
          description: "The text to translate",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "from",
          description: "The source language",
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
          required: false,
        },
      ]
    },
    {
      name: "weather",
      description: "Fetch the current weather for any places from www.weatherapi.com",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "location",
          description: "The location to fetch the weather data [string]",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: "options",
          description: "Options to change the output",
          type: ApplicationCommandOptionType.String,
          choices: [
            { name: "Use Imperial (˚F)", value: "imp" },
            { name: "Includes Air Quality", value: "aq" },
            { name: "Both", value: "both" },
          ],
          required: false,
        }
      ]
    },
    {
      name: "wikipedia",
      description: "Fetch a Wikipedia article",
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: [
        {
          name: "article",
          description: "Search for a Wikipedia article",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "query",
              description: "The query to search for",
              type: ApplicationCommandOptionType.String,
              autocomplete: true,
              required: true,
            }
          ]
        }
      ]
    },
  ]
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()
  switch (interaction.options.getSubcommandGroup()) {
    case "facts": {
      switch (interaction.options.getSubcommand()) {
        case "date": {
          const day = interaction.options.getInteger("day", true)
          const month = interaction.options.getInteger("month", true)
          const date = Temporal.ZonedDateTime.from({ year: 2020, month, day, timeZone: "UTC" })

          const { data } = await axios.get(`http://numbersapi.com/${date.month}/${date.day}/date`)
          interaction.editReply(data)
          break
        }

        case "number": {
          const mode = interaction.options.getString("mode", true)
          const number = interaction.options.getInteger("number", true)

          const { data } = await axios.get(`http://numbersapi.com/${number}/${mode}`)
          interaction.editReply(data)
        }
      }
      break
    }

    case "wikipedia": {
      switch (interaction.options.getSubcommand()) {
        case "article": {
          const article = interaction.options.getString("query", true)
          const page = await wikipedia.page(article)
          const summary = await page.summary()
          const { pages: related } = await page.related()

          interaction.editReply({ components: [{
            type: ComponentType.ActionRow,
            components: [{
              type: ComponentType.SelectMenu,
              placeholder: "Related Articles",
              custom_id: "wikipedia-related",
              options: [...related.map(page => {
                return { label: page.title.replaceAll("_", " ").slice(0, 100), value: page.pageid.toString().slice(0, 100), description: page.description?.slice(0, 100) || undefined }
              })].slice(0, 25)
            }]
          }], embeds: [{
            title: summary.title.replaceAll("_", " "),
            url: page.fullurl || undefined,
            description: `**\`\`\`${summary.description}\`\`\`**\n${summary.extract}`,
            color: parseInt(pickFromArray(colors), 16),
            thumbnail: summary.thumbnail ? { url: summary.thumbnail.source } : undefined,
          }] })
            .catch((err) => {return interaction.editReply(err)})
          break
        }
      }
      break
    }

    default: {
      switch (interaction.options.getSubcommand()) {
        case "covid": {
          var location = interaction.options.getString("location") as string
          if (!existsSync("./Resources/Covid/cache.json") || readFileSync("./Resources/Covid/cache.json").toString().length == 0) writeFileSync("./Resources/Covid/cache.json", JSON.stringify({}))

          const ts = Temporal.Now.instant()
          var cache = JSON.parse(readFileSync("./Resources/Covid/cache.json").toString())
          if (!Object.keys(cache).length || cache.timestamp < ts.epochMilliseconds) {
            var data = {}
            const { data: cases } = await axios.get("https://api.coronatracker.com/v3/stats/worldometer/country")
            const { data: global } = await axios.get("https://api.coronatracker.com/v3/stats/worldometer/global")

            data["Global"] = global as GlobalCovidCase
            cases.forEach((country: CountryCovidCase) => {
              data[country.country] = country
            })

            cache = { timestamp: ts.epochMilliseconds + 60 * 30, ...data }
            writeFile("./Resources/Covid/cache.json", JSON.stringify(cache, null, 2), (err) => {
              if (err) return console.error(err)
            })
          }
          repCovid(interaction, cache[location], location == "Global" ? ":globe_with_meridians:" : `:flag_${cache[location].countryCode.toLowerCase()}:`)
          break
        }

        case "definition": {
          const dictionary = interaction.options.getString("dictionary") as string
          const word = interaction.options.getString("word") as string
          if (word == "__") return await interaction.editReply("You must specify a word to search for")

          switch (dictionary) {
            case "dictapi": {
              await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
                .then((response: AxiosResponse) => {
                  let desc = ""
                  const { data } = response
                  data.forEach((entry: { meanings: any[] }) => {
                    entry.meanings.forEach((meaning: { partOfSpeech: string; synonyms: any[]; antonyms: any[]; definitions: any[] }) => {
                      desc += `\`\`\`${capitalize(meaning.partOfSpeech)}\`\`\``
                      desc += meaning.synonyms.length > 0 ? `**Synonyms:** ${meaning.synonyms.join(", ")}\n` : ""
                      desc += meaning.antonyms.length > 0 ? `**Antonyms:** ${meaning.antonyms.join(", ")}\n` : ""
                      desc += "\n**Meanings:**\n"

                      meaning.definitions.forEach((def: { definition: any; synonyms: any[]; antonyms: string | any[]; examples: any[]; example: any }, ind: number) => {
                        desc += `\`[${ind + 1}]\` ${def.definition}\n`
                        desc += def.synonyms.length > 0 ? `**• Synonyms:** ${def.synonyms.join(", ")}\n` : ""
                        desc += def.antonyms.length > 0 ? `**• Antonyms:** ${def.examples.join(", ")}\n` : ""
                        desc += def.example ? `**• Example:** ${def.example}\n` : ""
                        desc += "\n"
                      })
                    })
                  })

                  const phonetics = [...new Set(data[0].phonetics.filter((phonetic: { text: any }) => phonetic.text).map((phonetic: { text: any }) => phonetic.text))].join(" - ")

                  interaction.editReply({ embeds: [{
                    title: `${data[0].word} - ${phonetics || "—"}`,
                    color: parseInt(pickFromArray(colors), 16),
                    description: desc,
                    footer: { text: "Source: DictionaryAPI.dev & Wiktionary" }
                  }] })
                })
                .catch(() => {
                  console.botLog(`The word \`${word}\` was not found in the dictionary`, "WARN")
                  interaction.editReply(`${emojis.warn.shorthand} The word \`${word}\` was not found in the dictionary`)
                })
              break
            }

            case "urban": {
              await urban.define(word)
                .then((results: any[]) => {
                  const [result] = results
                  let descriptionBefore = `**Definition(s)**\n${result.definition}`
                  const descriptionAfter = `\n\n**Example(s)**\n${result.example}\n\n**Ratings** • ${result.thumbs_up} :+1: • ${result.thumbs_down} :-1:`

                  if (descriptionBefore.length + descriptionAfter.length > 4096) {
                    descriptionBefore = descriptionBefore.slice(0, 4095 - descriptionAfter.length) + "…"
                  }

                  const description = descriptionBefore + descriptionAfter

                  interaction.editReply({ embeds: [{
                    title: word,
                    url: result.permalink,
                    color: parseInt(pickFromArray(colors), 16),
                    description,
                    author: { name: `Urban Dictionary - ${result.author}` },
                    footer: { text: `Definition ID • ${result.defid} | Written on` },
                    timestamp: Temporal.Instant.from(result.written_on).toString()
                  }] })
                })
                .catch(() => {
                  console.botLog(`The word \`${word}\` was not found in the dictionary`, "WARN")
                  interaction.editReply(`${emojis.warn.shorthand} The word \`${word}\` was not found in the dictionary`)
                })
              break
            }
          }
          break
        }

        case "lyrics": {
          const id = interaction.options.getString("song")
          const request: AxiosRequestConfig = {
            method: "GET",
            url: `https://api.genius.com/songs/${id}`,
            params: { access_token: process.env.GeniusClientAccess },
          }

          const lyrics = await getLyrics(`https://genius.com/songs/${id}`)
            .catch(() => {return interaction.editReply(`The song ${id} was not found. Select one from the list next time.`)})

          await axios.request(request)
            .then((response: AxiosResponse) => {
              const { song: data } = response.data.response
              let title: string
              const [year, month, day] = data.release_date.split("-")

              interaction.editReply({ embeds: [{
                title: (title = `${data.title} - ${data.artist_names}`).length > 100 ? title.slice(0, 99) + "…" : title,
                color: parseInt(pickFromArray(colors), 16),
                description: lyrics || "No lyrics",
                thumbnail: { url: data.song_art_image_url },
                footer: { text: `Source • Genius | Album • ${data.album?.name || "None"} | Release Date` },
                timestamp: Temporal.ZonedDateTime.from({ year, month, day, timeZone: "UTC" }).toString({ timeZoneName: "never" }),
              }] })
            })

          break
        }

        case "translation": {
          const [src, dst, txt] = [interaction.options.getString("from") || "auto", interaction.options.getString("to"), interaction.options.getString("text")] as string[]
          googtrans(txt, { from: src, to: dst })
            .then(result => {
              interaction.editReply({ embeds: [{
                title: "Translation",
                color: parseInt(pickFromArray(colors), 16),
                fields: [
                  { name: `From ${googtrans.languages[result.from.language.iso]}`, value: `${txt}` },
                  { name: `To ${googtrans.languages[dst]}`, value: `${result.text}` },
                ]
              }] })
            })
            .catch((err: Error) => {return handleError(interaction, err, "Translation")})

          break
        }

        case "weather": {
          const location = interaction.options.getString("location")
          const options = interaction.options.getString("options")
          const [unit, dist, symbol, speed] = ["imp", "both"].includes(options as string)
            ? ["imperial", "mi", "˚F", "mi/h"]
            : ["metric", "km", "˚C", "m/s"]
          const isMetric = unit == "metric"

          await axios.get(encodeURI("https://api.weatherapi.com/v1/forecast.json"), { params: { key: process.env.WeatherAPI, q: location, days: 1, aqi: "yes" } })
            .then((response: AxiosResponse) => {
              const { data } = response
              const { location: locData } = data
              const now = Temporal.Now.instant()

              data.localTime = Temporal.Instant.fromEpochSeconds(locData.localtime_epoch)
              data.deviceTime = Temporal.Instant.fromEpochSeconds(now.epochSeconds - now.toZonedDateTimeISO("UTC").second)
              data.tz = Temporal.TimeZone.from(locData.tz_id).getOffsetNanosecondsFor(data.localTime) / TimeMetric.nano2hour
              data.title = `${locData.name}${locData.region == "" ? "" : ` - ${locData.region}`} - ${locData.country} (UTC${data.tz != 0 ? ` ${data.tz > 0 ? "+" : ""}${data.tz}` : ""})`

              const base = Temporal.Instant.fromEpochSeconds(data.forecast.forecastday[0].date_epoch)
              const discordTs: number[] = []
              const aqiRatings = [[null, "Good", "Moderate", "Unhealthy for Sensitive Group", "Unhealthy", "Very Unhealthy", "Hazardous"], [null, "Low", "Moderate", "High", "Very High"]]
              const times = [data.forecast.forecastday[0].astro.sunrise, data.forecast.forecastday[0].astro.sunset, data.forecast.forecastday[0].astro.moonrise, data.forecast.forecastday[0].astro.moonset]

              discordTs.push(...times.map((time: string, ind: number) => {
                var hr = parseInt(time.slice(0, 2)) - data.tz
                if (time.endsWith("PM")) hr += 12
                const mn = parseInt(time.slice(3, 5))
                if (time.startsWith("0")) times[ind] = time.slice(1)

                return Temporal.Instant.fromEpochSeconds(base.epochSeconds + hr * TimeMetric.sec2hour + mn * TimeMetric.sec2min).epochSeconds
              }))

              const weatherEmbed = {
                title: data.title,
                color: parseInt(pickFromArray(colors), 16),
                description: `Data Provided by ${emojis.WeatherAPI.shorthand} [WeatherAPI](https://www.weatherapi.com/)\`\`\`Weather • ${data.current.condition.text}\`\`\``,
                fields: [
                  { name: "Temperature   ", value: `${isMetric ? data.current.temp_c : data.current.temp_f}${symbol}`, inline: true },
                  { name: "Feels Like   ", value: `${isMetric ? data.current.feelslike_c : data.current.feelslike_f}${symbol}`, inline: true },
                  { name: "Min/Max Temp", value: `${isMetric ? data.forecast.forecastday[0].day.mintemp_c : data.forecast.forecastday[0].day.mintemp_f}/${isMetric ? data.forecast.forecastday[0].day.maxtemp_c : data.forecase.forecaseday[0].day.maxtemp_f}${symbol}`, inline: true },
                  { name: "Pressure", value: isMetric ? `${data.current.pressure_mb}hPa` : `${data.current.pressure_in}in`, inline: true },
                  { name: "Humidity", value: `${data.current.humidity}%`, inline: true },
                  { name: "Clouds", value: `${data.current.cloud}%`, inline: true },
                  { name: "Wind", value: `${isMetric ? data.current.wind_kph : data.current.wind_mph}${speed} ${data.current.wind_degree}˚ ${data.current.wind_dir}`, inline: true },
                  { name: "Gust", value: `${isMetric ? data.current.gust_kph : data.current.gust_mph}${speed}`, inline: true },
                  { name: "Visibility", value: `${isMetric ? data.current.vis_km : data.current.vis_miles}${dist}`, inline: true },
                  { name: "Sunrise", value: `${times[0]}\n(<t:${discordTs[0]}:t> Here)`, inline: true },
                  { name: "Sunset", value: `${times[1]}\n(<t:${discordTs[1]}:t> Here)`, inline: true },
                  { name: "UV Index", value: `${data.current.uv}`, inline: true },
                  { name: "Moonrise", value: `${times[2]}\n(<t:${discordTs[2]}:t> Here)`, inline: true },
                  { name: "Moonset", value: `${times[3]}\n(<t:${discordTs[3]}:t> Here)`, inline: true },
                  { name: "Moon Phase", value: `${data.forecast.forecastday[0].astro.moon_phase}\n${data.forecast.forecastday[0].astro.moon_illumination}% Illuminated`, inline: true },
                ],
                thumbnail: { url: `https:${data.current.condition.icon}` },
                timestamp: Temporal.Now.instant().toString(),
              }

              if (["aq", "both"].includes(options as string)) {
                weatherEmbed.fields.push(
                  { name: "\u200b", value: `\`\`\`Air Quality\nUS - EPA Rating • ${aqiRatings[0][data.current.air_quality["us-epa-index"]]}\nUK Defra Rating • ${aqiRatings[1][Math.ceil(data.current.air_quality["gb-defra-index"] / 3)]} Risk\`\`\``, inline: false },
                  { name: "CO", value: `${data.current.air_quality.co.toFixed(1)} μg/m³`, inline: true },
                  { name: "O₃", value: `${data.current.air_quality.o3.toFixed(1)} μg/m³`, inline: true },
                  { name: "NO₂", value: `${data.current.air_quality.no2.toFixed(1)} μg/m³`, inline: true },
                  { name: "SO₂", value: `${data.current.air_quality.so2.toFixed(1)} μg/m³`, inline: true },
                  { name: "PM 2.5", value: `${data.current.air_quality.pm2_5.toFixed(1)} μg/m³`, inline: true },
                  { name: "PM 10", value: `${data.current.air_quality.pm10.toFixed(1)} μg/m³`, inline: true },
                )
              }

              interaction.editReply({ embeds: [weatherEmbed] })
            })
            .catch((err: AxiosError) => {
              if (err.response?.data.error.code == 1006) return interaction.editReply({ content: `The location \`${err.config.params.q}\` was not found. Maybe check your spelling?` })
              handleError(interaction, err, "Weather")
            })
          break
        }
      }
      break
    }
  }
}

export async function selectMenu(interaction: SelectMenuInteraction) {
  if (interaction.customId == "wikipedia-related") {
    await interaction.deferUpdate()
    const [articleId] = interaction.values
    const page = await wikipedia.page(articleId)
    const summary = await page.summary()
    const { pages: related } = await page.related()

    interaction.editReply({ components: [{
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.SelectMenu,
        placeholder: "Related Articles",
        custom_id: "wikipedia-related",
        options: [...related.map(page => {
          return { label: page.title.replaceAll("_", " ").slice(0, 100), value: page.pageid.toString().slice(0, 100), description: page.description?.slice(0, 100) || undefined }
        })].slice(0, 25)
      }]
    }], embeds: [{
      title: summary.title.replaceAll("_", " "),
      url: page.fullurl || undefined,
      description: `**\`\`\`${summary.description}\`\`\`**\n${summary.extract}`,
      color: parseInt(pickFromArray(colors), 16),
      thumbnail: summary.thumbnail ? { url: summary.thumbnail.source } : undefined,
    }] })
      .catch((err) => {return interaction.editReply(err)})
  }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const current = interaction.options.getFocused() as string
  const blankInitial = { name: "Keep typing to continue…", value: "__" }
  const initial = { name: current || "Keep typing to continue…", value: current || "__" }
  let response: ApplicationCommandOptionChoice[] = []

  switch (interaction.options.getSubcommandGroup()) {
    case "wikipedia": {
      if (current.length == 0) return interaction.respond([initial])
      const choices: ApplicationCommandOptionChoice[] = (await wikipedia.search(current, { limit: 20 })).results.map(result => {
        return { name: result.title, value: `${result.pageid}` }
      })
      const fuse = new Fuse(choices, { distance: 20, keys: ["name", "value"] })
      response.push(...fuse.search(current as string).map(option => option.item))
      response.push(...choices.filter((option: ApplicationCommandOptionChoice) => !response.includes(option)))
      if (!interaction.responded) interaction.respond(response.slice(0, 20))
      break
    }

    default: {
      switch (interaction.options.getSubcommand()) {
        case "covid": {
          const fuse = new Fuse(choices, { distance: 25, keys: ["name", "value"] })
          response.push(...fuse.search(current as string).map(option => option.item))
          response.push(...choices.filter((option: ApplicationCommandOptionChoice) => !response.includes(option)))
          if (!interaction.responded) interaction.respond(response.slice(0, 25))
          break
        }

        case "definition": {
          const dict = interaction.options.getString("dictionary")
          if (dict == "dictapi") return interaction.respond([initial])

          await urban.autocomplete(current)
            .then((autocompleteRes: string[]) => {
              const results: ApplicationCommandOptionChoice[] = autocompleteRes.map((result: any) => {
                return { name: `${result}`, value: `${result}` }
              })

              const fuse = new Fuse(results, { distance: 25, keys: ["name", "value"] })
              const response: ApplicationCommandOptionChoice[] = [...fuse.search(current).map(option => option.item)]
              if (!response.includes(initial)) response.unshift(initial)
              if (!interaction.responded) interaction.respond(response.slice(0, 25))
            })
            .catch(() => interaction.respond([initial]))
          break
        }

        case "lyrics": {
          if (current.length == 0) return interaction.respond([initial])

          const options: ApplicationCommandOptionChoice[] = []
          await axios.get("https://api.genius.com/search", { params: { access_token: process.env.GeniusClientAccess, q: current }, })
            .then((response: AxiosResponse) => {
              options.push(...response.data.response.hits.map((hit: { result: { title: any; artist_names: any; id: any } }) => {
                let optName: string
                return {
                  name: (optName = `${hit.result.title} - ${hit.result.artist_names}`).length > 100 ? optName.slice(0, 99) + "…" : optName,
                  value: `${hit.result.id}`
                }
              }))
            })

          const fuse = new Fuse(options, { distance: options.length, keys: ["name", "value"] })
          response = [...fuse.search(current).map(option => option.item)]
          response.push(...options.filter((option: ApplicationCommandOptionChoice) => !response.includes(option)))
          if (!interaction.responded) interaction.respond(response.slice(0, 25))
          break
        }

        case "translation": {
          const { languages } = googtrans
          const languageList = Object.entries(languages).map(([k, v]) => {
            return { name: v, value: k }
          }).slice(0, -2) as ApplicationCommandOptionChoice[]

          const current = interaction.options.getFocused(true) as ApplicationCommandOptionChoice
          response = current.name == "from" ? [languageList[0]] : []
          const fuse = new Fuse(languageList.slice(1), { distance: 25, keys: ["name", "value"] })
          response.push(...fuse.search(current.value as string).map(option => option.item))
          response.push(...languageList.slice(1).filter((option: ApplicationCommandOptionChoice) => !response.includes(option)))
          if (!interaction.responded) interaction.respond(response.slice(0, 25))
          break
        }

        case "weather": {
          if (current.length == 0) return interaction.respond([blankInitial])

          await axios.get(encodeURI("https://api.weatherapi.com/v1/search.json"), { params: { key: process.env.WeatherAPI, q: current } })
            .then((res: AxiosResponse) => {
              if (res.data.length == 0) return interaction.respond([blankInitial])
              const data: ApplicationCommandOptionChoice[] = res.data.map((option: { id: number, name: string, region: string, country: string, lat: number, lon: number, url: string }) => {
                return { name: `${option.name}, ${option.country}`, value: `${option.name},${option.country}`.slice(0, 100) }
              })

              const fuse = new Fuse(data, { distance: data.length, keys: ["name", "value"] })
              response = [...fuse.search(current).map(option => option.item)]
              response.push(...data.filter((option: ApplicationCommandOptionChoice) => !response.includes(option)))
              if (!interaction.responded) interaction.respond(response.slice(0, 25))
            })
          break
        }
      }
      break
    }
  }
}
