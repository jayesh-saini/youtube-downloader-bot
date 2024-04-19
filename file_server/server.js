require("dotenv").config()
const url = require("url")
const http = require('http')
const ngrok = require('@ngrok/ngrok')
const redis = require('redis')
const { sql } = require('./db')
const fs = require("fs")

let NGROK_BASE_URL = "";
let cache = null, publisher = null;

(async () => {
    cache = redis.createClient()
    publisher = redis.createClient()

    await cache.connect()
    await publisher.connect()

    cache.on("error", (error) => {
        console.error(`Error : ${error}`)
    })

    console.log('Redis connected!')
})()

// Create webserver
http.createServer((req, res) => {
    console.log(req.url)
    var requestedURL = req.url
    if (requestedURL.startsWith('/video')) {

        const parsedUrl = url.parse(requestedURL, true)

        // Get the query parameters from the parsed URL
        const { video_id } = parsedUrl.query;

        if (video_id == null) {
            return res.end("Invalid video id")
        }

        sql.query("SELECT file_name FROM big_file_urls WHERE uuid = ?", video_id, (err, data) => {
            if (err) {
                console.log(err)
                return res.end("Something went wrong!")
            } else if (data.length == 1) {
                const videoPath = data[0].file_name

                fs.stat(videoPath, (err, stats) => {
                    if (err) {
                        console.error('Error reading video file:', err)
                        res.statusCode = 500;
                        res.end('Internal Server Error');
                        return
                    }

                    // Set headers
                    res.writeHead(200, {
                        'Content-Type': 'video/mp4',
                        'Content-Length': stats.size
                    })

                    const videoStream = fs.createReadStream(videoPath)
                    videoStream.pipe(res)
                })
            } else {
                console.log(data)
                return res.end("Video not found!")
            }
        })
    }
}).listen(8080, () => console.log('Node.js web server at 8080 is running...'))

// Get your endpoint online
ngrok.connect({ addr: 8080, authtoken_from_env: true })
    .then((listener) => {
        NGROK_BASE_URL = listener.url()
        cache.set("NGROK_BASE_URL", NGROK_BASE_URL)
        publisher.publish("NGROK_BASE_URL_UPDATED", NGROK_BASE_URL)
        console.log(`Ingress established at: ${listener.url()}`)
    })
