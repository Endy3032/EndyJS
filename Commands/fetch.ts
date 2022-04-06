import Fuse from "fuse.js"
import urban from "urban-dictionary"
import { getLyrics } from "genius-lyrics-api"
import googtrans from "@vitalets/google-translate-api"
import { existsSync, readFileSync, writeFile } from "fs"
import locationChoices from "../Resources/Covid/locations"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { capitalize, colors, emojis, handleError, random } from "../Modules"
import { ApplicationCommandType, ApplicationCommandOptionType, ApplicationCommandOptionChoice, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js"

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
        // #region current
        // {
        //   name: "current",
        //   description: "Get the weather from the chosen provider",
        //   type: ApplicationCommandOptionType.Subcommand,
        //   options: [
        //   ]
        // },
        // #endregion
        // #region forecast
        // {
        //   name: "forecast",
        //   description: "Get the forecast from the chosen provider",
        //   type: ApplicationCommandOptionType.Subcommand,
        //   options: [
        //     {
        //       name: "location",
        //       description: "The location to get the weather data [string]",
        //       type: ApplicationCommandOptionType.String,
        //       required: true
        //     },
        //     {
        //       name: "options",
        //       description: "Several options to change the output",
        //       type: ApplicationCommandOptionType.String,
        //       choices: [
        //         { name: "Use Imperial (˚F)", value: "imp" },
        //         { name: "Includes Air Quality", value: "aq" },
        //         { name: "Both", value: "both" },
        //       ],
        //       required: false,
        //     }
        //   ]
        // }
        // #endregion
      ]
    },
  ]
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()
  switch (interaction.options.getSubcommand()) {
    case "covid": {
      const location = interaction.options.getString("location") as string
      const query = location.startsWith("_continent") ? "continent" : "country"

      if (!existsSync("./Resources/Covid/cache.json")) writeFileSync("./Resources/Covid/cache.json", JSON.stringify({}))

      const ts = new Date()
      const cache = JSON.parse(readFileSync("./Resources/Covid/cache.json").toString())
      if (!cache[location] || cache.timestamp < ts) {
        cache.timestamp = ts.getTime() + 1000 * 60 * 10
        cache[location] = {}

        await axios.get(`https://covid-api.mmediagroup.fr/v1/cases?${query}=${location.replace("_continent", "")}`)
          .then(res => cache[location].cases = res.data.All)

        await axios.get(`https://covid-api.mmediagroup.fr/v1/vaccines?${query}=${location.replace("_continent", "")}`)
          .then(res => cache[location].vaccines = res.data.All)

        writeFile("./Resources/Covid/cache.json", JSON.stringify(cache, null, 2), (res) => {
          if (res) return console.error(res)
          interaction.editReply({ embeds: [{
            title: `Covid Stats - ${cache[location].cases.country} [${cache[location].cases.abbreviation || "_"}/${cache[location].cases.continent || "_"}]`,
            fields: [
              { name: "Confirmed Cases", value: `${cache[location].cases.confirmed.toLocaleString("en")}`, inline: true },
              { name: "Recovered", value: `${cache[location].cases.recovered.toLocaleString("en")}`, inline: true },
              { name: "Deaths", value: `${cache[location].cases.deaths.toLocaleString("en")}`, inline: true },
              { name: "Administered Vaccines", value: `${cache[location].vaccines.administered.toLocaleString("en")}`, inline: true },
              { name: "Vaccinated", value: `${cache[location].vaccines.people_vaccinated.toLocaleString("en")}`, inline: true },
              { name: "Partially Vaccinated", value: `${cache[location].vaccines.people_partially_vaccinated.toLocaleString("en")}`, inline: true },
            ],
            timestamp: ts.toISOString(),
          }] })
          
        })
      }


      break
    }

    case "definition": {
      const dictionary = interaction.options.getString("dictionary") as string
      const word = interaction.options.getString("word") as string
      if (word == "blankentry") return await interaction.editReply("You must specify a word to search for")

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
                descriptionBefore = descriptionBefore.slice(0, 4093 - descriptionAfter.length) + "..."
              }

              const description = descriptionBefore + descriptionAfter

              interaction.editReply({ embeds: [{
                title: word,
                url: result.permalink,
                description,
                author: { name: `Urban Dictionary - ${result.author}` },
                footer: { text: `Definition ID • ${result.defid} | Written on` },
                timestamp: new Date(result.written_on).toISOString()
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

          interaction.editReply({ embeds: [{
            title: (title = `${data.title} - ${data.artist_names}`).length > 100 ? title.slice(0, 97) + "..." : title,
            description: lyrics || "No lyrics",
            thumbnail: { url: data.song_art_image_url },
            footer: { text: `Source • Genius | Album • ${data.album?.name || "None"} | Release Date` },
            timestamp: new Date(data.release_date).toISOString(),
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
            fields: [
              { name: `From ${googtrans.languages[result.from.language.iso]}`, value: `${txt}` },
              { name: `To ${googtrans.languages[dst]}`, value: `${result.text}` },
            ]
          }] })
        })
        .catch((err: Error) => {
          return handleError(interaction, err as Error, "Translation")
        })

      break
    }

    case "weather": {
      const location = interaction.options.getString("location")
      const options = interaction.options.getString("options")
      const [unit, dist, symbol, speed] = ["imp", "both"].includes(options as string)
        ? ["imperial", "mi", "˚F", "mi/h"]
        : ["metric", "km", "˚C", "m/s"]

      await axios.get(encodeURI("https://api.weatherapi.com/v1/forecast.json"), { params: { key: process.env.WeatherAPI, q: location, days: 1, aqi: "yes" } })
        .then((response: AxiosResponse) => {
          const { data } = response
          const { location: dataLoc } = data
          const now = new Date()

          data.deviceTime = new Date(now.getTime() - now.getSeconds() * 1000 - now.getMilliseconds())
          data.localTime = new Date(dataLoc.localtime)
          data.tz = Math.round(-((data.deviceTime - data.localTime) / 60000 + data.deviceTime.getTimezoneOffset()) / 60)

          data.title = `${dataLoc.name}${dataLoc.region == "" ? "" : ` - ${dataLoc.region}`} - ${dataLoc.country} (UTC${data.tz != 0 ? ` ${data.tz > 0 ? "+" : ""}${data.tz}` : ""})`

          const times = [data.forecast.forecastday[0].astro.sunrise, data.forecast.forecastday[0].astro.sunset, data.forecast.forecastday[0].astro.moonrise, data.forecast.forecastday[0].astro.moonset]
          const base = new Date(data.forecast.forecastday[0].date_epoch * 1000)
          const astro_time: number[] = []
          const aqi_ratings = [[null, "Good", "Moderate", "Unhealthy for Sensitive Group", "Unhealthy", "Very Unhealthy", "Hazardous"], [null, "Low", "Moderate", "High", "Very High"]]

          times.forEach((time: string, ind: number) => {
            var hr = parseInt(time.slice(0, 2)) - data.tz
            if (time.endsWith("PM")) hr += 12
            const mn = parseInt(time.slice(3, 5))

            astro_time.push(new Date(base.getTime() + (hr * 3600 + mn * 60) * 1000).getTime() / 1000)
            if (time.startsWith("0")) times[ind] = time.slice(1)
          })
          const isMetric = unit == "metric"
          // Data Provided by <:WeatherAPI:932557801153241088> [WeatherAPI](https://www.weatherapi.com/)
          const weatherEmbed = {
            title: data.title,
            color: parseInt(random.pickFromArray(colors), 16),
            description: `${data.current.condition.text}\n\n\`\`\`Weather\`\`\``,
            fields: [
              { name: "Temperature   ", value: `${isMetric ? data.current.temp_c : data.current.temp_f}${symbol}`, inline: true },
              { name: "Feels Like   ", value: `${isMetric ? data.current.feelslike_c : data.current.feelslike_f}${symbol}`, inline: true },
              { name: "Min/Max Temp", value: `${isMetric ? data.forecast.forecastday[0].day.mintemp_c : data.forecast.forecastday[0].day.mintemp_f}/${isMetric ? data.forecast.forecastday[0].day.maxtemp_c : data.forecase.forecaseday[0].day.maxtemp_f}${symbol}`, inline: true },
              { name: "Pressure", value: isMetric ? `${data.current.pressure_mb}hPa` : `${data.current.pressure_in}in`, inline: true },
              { name: "Humidity", value: `${data.current.humidity}%`, inline: true },
              { name: "Clouds", value: `${data.current.cloud}%`, inline: true },
              { name: "Wind", value: `${isMetric ? data.current.wind_kph : data.current.wind_mph}${speed} ${data.current.wind_degree}˚`, inline: true },
              { name: "Gust", value: `${isMetric ? data.current.gust_kph : data.current.gust_mph}${speed}`, inline: true },
              { name: "Visibility", value: `${isMetric ? data.current.vis_km : data.current.vis_miles}${dist}`, inline: true },
              { name: "Sunrise", value: `${times[0]}\n(<t:${astro_time[0]}:t> Here)`, inline: true },
              { name: "Sunset", value: `${times[1]}\n(<t:${astro_time[1]}:t> Here)`, inline: true },
              { name: "UV Index", value: `${data.current.uv}`, inline: true },
              { name: "Moonrise", value: `${times[2]}\n(<t:${astro_time[2]}:t> Here)`, inline: true },
              { name: "Moonset", value: `${times[3]}\n(<t:${astro_time[3]}:t> Here)`, inline: true },
              { name: "Moon Phase", value: `${data.forecast.forecastday[0].astro.moon_phase}\n${data.forecast.forecastday[0].astro.moon_illumination}% Illuminated`, inline: true },
            ],
            thumbnail: { url: `https:${data.current.condition.icon}` },
            footer: { text: "Source • WeatherAPI | Timestamp", icon_url: "https://cdn.discordapp.com/attachments/927068773104619570/927444221403746314/WeatherAPI.png" },
            timestamp: new Date().toISOString(),
          }

          if (["aq", "both"].includes(options as string)) {
            weatherEmbed.fields.push(
              { name: "\u200b", value: "```Air Quality```", inline: false },
              { name: "US - EPA Rating", value: `${aqi_ratings[0][data.current.air_quality["us-epa-index"]]}`, inline: true },
              { name: "UK Defra Rating", value: `${aqi_ratings[1][Math.ceil(data.current.air_quality["gb-defra-index"] / 3)]} Risk`, inline: true },
              { name: "\u200b", value: "\u200b", inline: true },
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
        .catch(e => {
          handleError(interaction, e, "Weather")
          interaction.editReply({ content: e.response.data.error.code == 1006
            ? `The location \`${e.config.params.q}\` was not found. Maybe check your spelling?`
            : `There was an unknown problem responding to your requests.\n**Quick Info**\nStatus: ${e.response.status} - ${e.response.statusText}\nProvided Location: ${e.config.params.q}`
          })
        })
      break
    }
  }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  switch (interaction.options.getSubcommand()) {
    case "covid": {
      const location = interaction.options.getFocused()
      const res: ApplicationCommandOptionChoice[] = []
      const fuse = new Fuse(locationChoices.slice(1), { distance: 25, keys: ["name", "value"] })
      fuse.search(location as string).forEach(option => res.push(option.item))
      res.push(...locationChoices.slice(1).filter((option: ApplicationCommandOptionChoice) => !res.includes(option)))

      interaction.respond(res.slice(0, 25))
      break
    }

    case "definition": {
      const dict = interaction.options.getString("dictionary")
      const current = interaction.options.getFocused() as string
      const curObject = { name: `${current || "Keep typing to get results!"}`, value: `${current || "blankentry"}` }

      if (dict == "dictapi") return interaction.respond([curObject])

      await urban.autocomplete(current)
        .then((autocompleteRes: string[]) => {
          const results = autocompleteRes.map((result: any) => {
            return { name: `${result}`, value: `${result}` }
          })

          const res: ApplicationCommandOptionChoice[] = []
          const fuse = new Fuse(results, { distance: 24, keys: ["name", "value"] })
          fuse.search(current).forEach(option => {res.push(option.item as { name: string, value: string })})
          if (!res.includes(curObject)) res.unshift(curObject)
          interaction.respond(res)
        })
        .catch(() => {return interaction.respond([curObject])})
      break
    }

    case "lyrics": {
      const song = interaction.options.getFocused() as string
      if (song.length == 0) {return interaction.respond([{ name: "Enter something to get started", value: "empty" }])}

      const options: ApplicationCommandOptionChoice[] = []
      await axios.get("https://api.genius.com/search", { params: { access_token: process.env.GeniusClientAccess, q: song }, })
        .then((response: AxiosResponse) => {
          let optName: string
          response.data.response.hits.forEach((hit: { result: { title: any; artist_names: any; id: any } }) => {
            options.push({
              name: (optName = `${hit.result.title} - ${hit.result.artist_names}`).length > 100 ? optName.slice(0, 97) + "..." : optName,
              value: `${hit.result.id}`
            })
          })
        })

      const res: ApplicationCommandOptionChoice[] = []
      const fuse = new Fuse(options, { distance: options.length, keys: ["name", "value"] })
      fuse.search(song).forEach(option => res.push(option.item))
      res.push(...options.filter((option: ApplicationCommandOptionChoice) => !res.includes(option)))

      interaction.respond(res)
      break
    }

    case "translation": {
      const current = interaction.options.getFocused(true) as ApplicationCommandOptionChoice
      const { languages } = googtrans
      const languageList = Object.entries(languages).map(([k, v]) => {
        return { name: v, value: k }
      }).slice(0, -2) as { name: string, value: string }[]

      const res: ApplicationCommandOptionChoice[] = current.name == "from" ? [languageList[0]] : []
      const fuse = new Fuse(languageList.slice(1), { distance: 25, keys: ["name", "value"] })
      fuse.search(current.value as string).forEach(option => res.push(option.item))
      res.push(...languageList.slice(1).filter((option: ApplicationCommandOptionChoice) => !res.includes(option)))

      interaction.respond(res.slice(0, 25))
      break
    }
  }
}