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

    setupRoom(room.id, require, msg.client, true)
    const roomObj = new Room({
      id: room.id,
      require: require,
      gameState: {}
    })

    roomObj.save().catch((e) => { throw e })

    return room
  }

  function setupRoom (roomId, gameRequire, client, first = false) {
    if (!client.channels.has(roomId)) {
      return deleteGameRoom(roomId, client)
    }

    // inhibit commands in this room
    let inhibitor = function (message) {
      if (message.channel.id === roomId) {
        const prefix = message.guild ? message.guild.commandPrefix : this.client.commandPrefix
        const content = message.content.substring(prefix.length).trim()

        Room.findOne({id: roomId}).then(async (room) => {
          if (room.gameState === undefined || room.gameState === null) {
            room.gameState = {}
          }
          let result = require(gameRequire)(content, room.gameState)

          if (result === false) {
            return deleteGameRoom(roomId, client, message.guild)
          }

          room.gameState = result.gameState
          room.markModified('gameState')
          await room.save().catch((err) => { message.say(`ERROR SAVING THE GAME: ${err}`) })

          message.say(result.message)
        }).catch((e) => {
          throw e
        })

        return true
      }

      return false
    }

    client.gamerooms[roomId] = inhibitor
    client.dispatcher.addInhibitor(inhibitor)
    if (first) {
      client.channels.get(roomId).send('Welcome! All commands sent to me in this channel will be sent to the game. Have fun!')
    } else {
      client.channels.get(roomId).send('Please, continue...')
    }

    console.log('gameroom: roomId', roomId)
  }

  function deleteGameRoom (roomId, client, guild) {
    let inhibitor = client.gamerooms[roomId]
    if (typeof inhibitor === 'function') {
      client.dispatcher.removeInhibitor(inhibitor)
    }

    delete client.gamerooms[roomId]
    if (guild) {
      let room = guild.channels.get(roomId)
      room.send('Thanks for playing, the room will be deleted in 10 seconds')
    }
    setTimeout(() => {
      Room.findOneAndRemove({id: roomId}).then((err) => {
        if (guild) {
          let room = guild.channels.get(roomId)
          room.delete()
        }

        if (err) {
          console.error(err)
        }

        console.log('closed room', roomId)
      })
    }, 10000)
  }
})()
