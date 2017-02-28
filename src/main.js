const Discord = require('discord.js')
const client = new Discord.Client()
const Brain = require('./essentials/brain.js')

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`)
  client.helpResponse = '\n' + client.help.map(function (helpBlock) {
    return client.user.toString() + ' ' + helpBlock.expect + ' : ' + helpBlock.description
  }).join('\n')
})

client.brain = new Brain(client)
client.logger = console
client.help = []
client.respond = function (regex, callback, help) {
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
  if (help) {
    client.help.push(help)
  }
}

client.respond(/help/i, function (msg) {
  msg.reply(client.helpResponse)
}, {expect: 'help', description: 'lists the available commands'})

var normalizedPath = require('path').join(__dirname, 'scripts')

require('fs').readdirSync(normalizedPath).forEach(function (file) {
  require('./scripts/' + file)(client)
})

client.login(process.env.HUBOT_DISCORD_TOKEN).catch(console.error)
