(function () {
  module.exports = createGameRoom

  const discordjs = require('discord.js')

  function createGameRoom (msg, responses, name) {
    // give all players access
    let overwrites = []
    let readwrite = new discordjs.Permissions(['READ_MESSAGES', 'SEND_MESSAGES']).bitfield
    responses.first().users.map((user) => {
      overwrites.push({
        id: user.id,
        type: 'member',
        allow: readwrite
      })
    })

    overwrites.push({
      id: msg.guild.defaultRole.id,
      type: 'role',
      deny: 1024
    })

    let discriminator = Math.floor(Math.random() * 1000)

    // create a room
    console.log('overwrites', overwrites)
    let room = msg.guild.createChannel(`${name}-${discriminator}`, 'text', overwrites)
    // inhibit commands in this room
    return room
  }
})()
