(function () {
  module.exports = {
    createGameRoom,
    setupRoom,
    deleteGameRoom,
    init
  }

  const discordjs = require('discord.js')
  const Room = require('./room')

  async function init (client) {
    let rooms = await Room.find({})
    rooms.map((room) => {
      setupRoom(room.id, room.require, client)
    })
  }

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
    const room = await msg.guild.createChannel(`${name}-${discriminator}`, 'text', overwrites)

    setupRoom(room.id, require, msg.client)
    const roomObj = new Room({
      id: room.id,
      require: require
    })

    roomObj.save().catch((e) => { throw e })

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

    console.log('gameroom: roomId', roomId)
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
