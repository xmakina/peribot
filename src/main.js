const Discord = require('discord.js')
const client = new Discord.Client()
const Brain = require('./essentials/brain.js')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`)
})

client.brain = new Brain(client)
client.logger = console

client.respond = function (regex, callback) {
  client.on('message', function (msg) {
    if (msg.content.startsWith(client.user.toString())) {
      var match = msg.content.match(regex)
      if (match) {
        msg.match = match
        try {
          callback(msg)
        } catch(err) {
          client.logger.error(err)
        }
      }
    }
  })
}

var normalizedPath = require('path').join(__dirname, 'scripts')

require('fs').readdirSync(normalizedPath).forEach(function (file) {
  require('./scripts/' + file)(client)
})

client.login(process.env.HUBOT_DISCORD_TOKEN).catch(console.error)
