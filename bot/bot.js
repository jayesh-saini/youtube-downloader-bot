require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const { sql } = require('./db')
const fs = require("fs")

const queue = require('./queue')

const token = process.env.TELEGRAM_BOT_TOKEN

const bot = new TelegramBot(token, { polling: true });

var NGROK_BASE_URL = null

setTimeout(async () => {
    console.log(`Setting NGROK Base URL from cache!`)
    NGROK_BASE_URL = await queue.cache.get("NGROK_BASE_URL") 
}, 3000);

const isValidURL = (video_url) => {
    if (video_url.startsWith("https://youtube.com") || video_url.startsWith("https://youtu.be") || video_url.startsWith("https://www.youtube.com")) {
        return true
    }
    return false
}

queue.subscriber.subscribe('download_complete', (video_id) => {
    console.log(video_id)
    sql.query(`SELECT * FROM big_file_urls WHERE uuid = '${video_id}'`, (error, data) => {
        if (error) {
            console.log(error)
        } else {
            const file_size = fs.statSync(data[0].file_name).size
            const  caption = `NOTE: The provided url is temporary, and may expire any time.\nPlease download the file asap!\n\n${NGROK_BASE_URL}/video?video_id=${data[0].uuid}`
            if (file_size > 50000000) {
                // Send URL!
                bot.sendMessage(+data[0].chat_id, caption)
            } else {
                // Send file!
                bot.sendDocument(+data[0].chat_id, data[0].file_name, { caption })
            }
        }
    })
})

queue.subscriber.subscribe('NGROK_BASE_URL_UPDATED', (updated_base_url) => {
    console.log(`NGROK Base URL Updated!`)
    NGROK_BASE_URL = updated_base_url
})

bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const messageText = msg.text

    const { first_name = "f_name", last_name = "l_name", username = "u_name" } = msg.from

    console.log(chatId, messageText);

    if (messageText === '/start') {
        bot.sendMessage(chatId, 'Welcome to the bot!');
    } else if (isValidURL(messageText)) {
        bot.sendMessage(chatId, 'Your video would be downloaded soon!')
        if (queue != null) {
            await queue.push(JSON.stringify({
                video_url: messageText,
                name: `${first_name} ${last_name}`,
                username,
                chat_id: chatId
            }))
        }
    } else {
        bot.sendMessage(chatId, "Please send a valid URl!")
    }
})