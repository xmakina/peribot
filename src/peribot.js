/* eslint-disable no-console */
const commando = require('discord.js-commando')
const path = require('path')
const oneLine = require('common-tags').oneLine
const MongoDBProvider = require('./providers/mongodb')
const token = process.env.COMMANDO_AUTH_TOKEN
const gameRooms = require('discord.js-gamerooms')

const client = new commando.Client({
  owner: process.env.COMMANDO_OWNER_ID,
  commandPrefix: process.env.COMMANDO_CMD_PREFIX
})

client.logger = console
require('./utils/router.js')(client)
require('./keep-alive/keep-alive.js')(client)

client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('debug', console.log)
  .on('ready', () => {
    console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`)
    gameRooms.init(client)
  })
  .on('disconnect', () => {
    console.warn('Disconnected!')
  })
  .on('reconnecting', () => {
    console.warn('Reconnecting...')
  })
  .on('commandError', (cmd, err) => {
    if (err instanceof commando.FriendlyError) return
    console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err)
  })
  .on('commandBlocked', (msg, reason) => {
    console.log(oneLine`
Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
blocked; ${reason}
`)
  })
  .on('commandPrefixChange', (guild, prefix) => {
    console.log(oneLine`
Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
`)
  })
  .on('commandStatusChange', (guild, command, enabled) => {
    console.log(oneLine`
Command ${command.groupID}:${command.memberName}
${enabled ? 'enabled' : 'disabled'}
${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
`)
  })
  .on('groupStatusChange', (guild, group, enabled) => {
    console.log(oneLine`
Group ${group.id}
${enabled ? 'enabled' : 'disabled'}
${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
`)
  })

client.setProvider(new MongoDBProvider({
  mongoURI: process.env.MONGODB_URI,
  mongoDebug: process.env.DEBUG
}))
  .catch(console.error)

client.registry
  .registerGroup('memes', 'Memes')
  .registerGroup('games', 'Games')
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.login(token)

client.inhibited = []
client.gamerooms = {}
