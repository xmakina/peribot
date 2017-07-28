(function () {
  module.exports = {
    createGameRoom,
    setupRoom,
    deleteGameRoom
  }

  const discordjs = require('discord.js')

  async function createGameRoom (msg, responses, name, require) {
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
      id: msg.client.user.id,
      type: 'member',
      allow: readwrite
    })

    overwrites.push({
      id: msg.guild.defaultRole.id,
      type: 'role',
      deny: 1024
    })

    let discriminator = Math.floor(Math.random() * 1000)

    // create a room
    let room = await msg.guild.createChannel(`${name}-${discriminator}`, 'text', overwrites)

    setupRoom(room.id, require, msg.client)

    return room
  }

  function setupRoom (roomId, gameRequire, client) {
    // inhibit commands in this room
    let inhibitor = function (msg) {
      if (msg.channel.id === roomId) {
        console.log('inhibiting for room ' + roomId)
        require(gameRequire)(msg)
        return `inhibiting for room ${roomId}`
      }
    }

    client.gamerooms[roomId] = inhibitor
    client.dispatcher.addInhibitor(inhibitor)
  }

  function deleteGameRoom (msg, roomId) {
    let inhibitor = msg.client.gamerooms[roomId]
    msg.client.dispatcher.removeInhibitor(inhibitor)
    delete msg.client.gamerooms[roomId]
    let room = msg.guild.channels.get(roomId)
    room.delete()
    console.log('closed room', roomId)
  }
})()
