import Fuse from "fuse.js"
import urban from "urban-dictionary"
import { getLyrics } from "genius-lyrics-api"
import { capitalize, colors, emojis, random } from "../modules"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { ApplicationCommandType, ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js"

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
    case "definition": {
      const dictionary = interaction.options.getString("dictionary") as string
      const word = interaction.options.getString("word") as string
      if (word == "blankentry") return await interaction.editReply("You must specify a word to search for")

      switch (dictionary) {
        case "dictapi": {
          const request: AxiosRequestConfig = {
            method: "GET",
            url: `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
          }

          await axios.request(request)
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
              console.botLog(`The word ${word} was not found in the dictionary`, "WARN")
              interaction.editReply(`${emojis.warn.shorthand} The word ${word} was not found in the dictionary`)
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
                description: description,
                author: { name: `Urban Dictionary - ${result.author}` },
                footer: { text: `Definition ID • ${result.defid} | Written on` },
                timestamp: new Date(result.written_on).toISOString()
              }] })
            })
            .catch(() => {
              console.botLog(`The word ${word} was not found in the dictionary`, "WARN")
              interaction.editReply(`${emojis.warn.shorthand} The word ${word} was not found in the dictionary`)
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

    case "weather": {
      const location = interaction.options.getString("location")
      const options = interaction.options.getString("options")
      let unit: string, dist: string, symbol: string, speed: string

      if (options == "imp" || options == "both") {
        unit = "imperial"
        dist = "mi"
        symbol = "˚F"
        speed = "mi/h"
      } else {
        unit = "metric"
        dist = "km"
        symbol = "˚C"
        speed = "m/s"
      }

      const request: AxiosRequestConfig = {
        method: "GET",
        url: encodeURI("https://api.weatherapi.com/v1/forecast.json"),
        params: { key: process.env.WeatherAPI, q: location, days: 1, aqi: "yes" }
      }

      await axios.request(request)
        .then((response: AxiosResponse) => {
          const { data } = response
          const now = new Date()

          data.deviceTime = new Date(now.getTime() - now.getSeconds() * 1000 - now.getMilliseconds())
          data.localTime = new Date(data.location.localtime)
          data.tz = Math.round(-((data.deviceTime - data.localTime) / 60000 + data.deviceTime.getTimezoneOffset()) / 60)

          data.location.region == ""
            ? data.title = `${data.location.name} - ${data.location.country} (UTC${data.tz != 0 ? data.tz > 0 ? " +" : "" : ""}${data.tz != 0 ? data.tz : ""})`
            : data.title = `${data.location.name} - ${data.location.region} - ${data.location.country} (UTC${data.tz != 0 ? data.tz > 0 ? " +" : "" : ""}${data.tz != 0 ? data.tz : ""})`

          const times = [data.forecast.forecastday[0].astro.sunrise, data.forecast.forecastday[0].astro.sunset, data.forecast.forecastday[0].astro.moonrise, data.forecast.forecastday[0].astro.moonset]
          const base = new Date(data.forecast.forecastday[0].date_epoch * 1000)
          const astro_time: number[] = []
          const aqi_ratings = [[null, "Good", "Moderate", "Unhealthy for Sensitive Group", "Unhealthy", "Very Unhealthy", "Hazardous"], [null, "Low", "Moderate", "High", "Very High"]]

          times.forEach((time: string, ind: string | number) => {
            time = String(time)
            let hr = parseInt(time.slice(0, 2)) - data.tz
            const mn = parseInt(time.slice(3, 5))
            if (time.endsWith("PM")) hr += 12

            astro_time.push(new Date(base.getTime() + (hr * 3600 + mn * 60) * 1000).getTime() / 1000)

            if (time.startsWith("0")) times[ind] = time.slice(1)
          })

          // Data Provided by <:WeatherAPI:932557801153241088> [WeatherAPI](https://www.weatherapi.com/)
          const weatherEmbed = {
            title: data.title,
            color: parseInt(random.pickFromArray(colors), 16),
            description: `${data.current.condition.text}\n\`\`\`Weather\`\`\``,
            fields: [
              { name: "Temperature   ", value: `${(unit == "metric" ? data.current.temp_c : data.current.temp_f) + symbol}`, inline: true },
              { name: "Feels Like   ", value: `${(unit == "metric" ? data.current.feelslike_c : data.current.feelslike_f) + symbol}`, inline: true },
              { name: "Min/Max Temp", value: `${unit == "metric" ? data.forecast.forecastday[0].day.mintemp_c + symbol + "/" + data.forecast.forecastday[0].day.maxtemp_c + symbol : data.forecast.forecastday[0].day.mintemp_f + symbol + "/" + data.forecast.forecastday[0].day.maxtemp_f + symbol}`, inline: true },
              { name: "Pressure", value: `${unit == "metric" ? data.current.pressure_mb + " hPa" : data.current.pressure_in + " in"}`, inline: true },
              { name: "Humidity", value: `${data.current.humidity}%`, inline: true },
              { name: "Clouds", value: `${data.current.cloud}%`, inline: true },
              { name: "Wind", value: `${(unit == "metric" ? data.current.wind_kph : data.current.wind_mph) + speed} ${data.current.wind_degree}˚`, inline: true },
              { name: "Gust", value: `${(unit == "metric" ? data.current.gust_kph : data.current.gust_mph) + speed}`, inline: true },
              { name: "Visibility", value: `${(unit == "metric" ? data.current.vis_km : data.current.vis_miles) + dist}%`, inline: true },
              { name: "Sunrise", value: `<t:${astro_time[0]}:T>\n${times[0]} Local`, inline: true },
              { name: "Sunset", value: `<t:${astro_time[1]}:T>\n${times[1]} Local`, inline: true },
              { name: "UV Index", value: `${data.current.uv}`, inline: true },
              { name: "Moon Phase", value: `${data.forecast.forecastday[0].astro.moon_phase}\n${data.forecast.forecastday[0].astro.moon_illumination}% Illumination`, inline: true },
              { name: "Moonrise", value: `<t:${astro_time[2]}:T>\n${times[2]} Local`, inline: true },
              { name: "Moonset", value: `<t:${astro_time[3]}:T>\n${times[3]} Local`, inline: true },
            ],
            thumbnail: { url: `https:${data.current.condition.icon}` },
            footer: { text: "Data Provided by WeatherAPI", icon_url: "https://cdn.discordapp.com/attachments/927068773104619570/927444221403746314/WeatherAPI.png" },
            timestamp: new Date().toISOString(),
          }

          if (options == "aq" || options == "both") {
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
          console.log(e)
          e.response.data.error.message == "No matching location found."
            ? interaction.editReply({ content: `The location \`${e.config.params.q}\` was not found. Maybe check your spelling?` })
            : interaction.editReply({ content: `There was an unknown problem responding to your requests.\n**Quick Info**\nStatus: ${e.response.status} - ${e.response.statusText}\nProvided Location: ${e.config.params.q}` })
        })
      break
    }
  }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  switch (interaction.options.getSubcommand()) {
    case "definition": {
      const dict = interaction.options.getString("dictionary")
      const current = interaction.options.getFocused() as string
      const curObject = { name: `${current || "Keep typing to get results!"}`, value: `${current || "blankentry"}` }

      if (dict == "dictapi") {
        return interaction.respond([curObject])
      }
      await urban.autocomplete(current)
        .then((results: readonly unknown[]) => {
          results = results.map((result: any) => {
            return { name: `${result}`, value: `${result}` }
          })

          const res: { name: string, value: string }[] = []
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

      const request: AxiosRequestConfig = {
        method: "GET",
        url: "https://api.genius.com/search",
        params: { access_token: process.env.GeniusClientAccess, q: song },
      }

      const options: { name: string, value: string }[] = []
      await axios.request(request)
        .then((response: AxiosResponse) => {
          let optName: string
          response.data.response.hits.forEach((hit: { result: { title: any; artist_names: any; id: any } }) => {
            options.push({
              name: (optName = `${hit.result.title} - ${hit.result.artist_names}`).length > 100 ? optName.slice(0, 97) + "..." : optName,
              value: `${hit.result.id}`
            })
          })
        })

      const res: { name: string, value: string }[] = []
      const fuse = new Fuse(options, { distance: options.length, keys: ["name", "value"] })
      fuse.search(song).forEach(option => res.push(option.item))
      res.push(...options.filter((option: any) => !res.includes(option)))

      interaction.respond(res)
      break
    }
  }
}
