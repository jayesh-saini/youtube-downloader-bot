const redis = require('redis')

let queue = null, subscriber = null, cache = null;

(() => {
    return new Promise(async (resolve, reject) => {
        queue = redis.createClient( { host: "redis", port: 6379 } )
        subscriber = redis.createClient( { host: "redis", port: 6379 } )
        publisher = redis.createClient( { host: "redis", port: 6379 } )
        cache = redis.createClient( { host: "redis", port: 6379 } )

        await subscriber.connect()
        await publisher.connect()
        await cache.connect()
        await queue.connect()
    
        queue.on("error", (error) => {
            console.error(`Error : ${error}`)
            return reject(error)
        })
    
        console.log('Redis connected!');
        resolve(queue)
    })
})()

exports.cache = cache
exports.subscriber = subscriber

exports.push = async (value) => {
    try {
        const r = await queue.lPush('youtube_download_queue', value)
        return r
    } catch (error) {
        console.log(error)
    }
}

exports.pop = async (value) => {
    return new Promise(async(resolve, reject) => {
        try {
            const data = await queue.rPop('youtube_download_queue')
            return resolve(data)
        } catch (error) {
            console.log(error)
            return reject(error)
        }
    })
}