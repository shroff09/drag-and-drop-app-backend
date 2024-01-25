const { createClient, RedisClient, Multi } = require('redis')
const development = require('./default.json')
const { promisifyAll } = require('bluebird')
const Config = process.env.NODE_ENV && process.env.NODE_ENV === 'production' ? development : development

promisifyAll(RedisClient.prototype);
promisifyAll(Multi.prototype);
const redisClient = createClient(Config)

redisClient.on('ready', function () {
  console.log('Redis is ready')
})
redisClient.on('error', function (err) {
  console.log('Global Redis Error ' + err)
})
module.exports = { redisClient }
