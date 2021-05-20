const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')
// This file would be created soon
const parser = require('./parser.js')
const generator = require('./Parser.bs.js')

require('dotenv').config()

const token = process.env.TELEGRAM_TOKEN
let bot

if (process.env.NODE_ENV === 'production') {
  bot = new TelegramBot(token)
  bot.setWebHook(process.env.HEROKU_URL + bot.token)
} else {
  bot = new TelegramBot(token, { polling: true })
}

const express = require('express')
const app = express()

app.use(express.json())
app.listen(process.env.PORT)
app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

bot.onText(/\/pog (1000|[0-9][0-9][0-9]|[0-9][0-9]|[1-9])/, (msg, match) => {
  const chatId = msg.chat.id
  const number = match[1]
  Promise.resolve(generator.getPogList(number)).then(
    (result) => {
      result.foreach((element) => {
        bot.sendMessage(chatId, element)
      })
    },
    (error) => {
      bot.sendMessage(chatId, 'Something went wrong')
    }
  )
})

// Matches "/word whatever"
bot.onText(/\/word (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const word = match[1]
  axios
    .get(`${process.env.OXFORD_API_URL}/entries/en-gb/${word}`, {
      params: {
        fields: 'definitions',
        strictMatch: 'false',
      },
      headers: {
        app_id: process.env.OXFORD_APP_ID,
        app_key: process.env.OXFORD_APP_KEY,
      },
    })
    .then((response) => {
      const parsedHtml = parser(response.data)
      bot.sendMessage(chatId, parsedHtml, { parse_mode: 'HTML' })
    })
    .catch((error) => {
      const errorText =
        error.response.status === 404
          ? `No definition found for the word: <b>${word}</b>`
          : `<b>An error occured, please try again later</b>`
      bot.sendMessage(chatId, errorText, { parse_mode: 'HTML' })
    })
})
