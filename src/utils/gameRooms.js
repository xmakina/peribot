(function () {
  module.exports = {
    createGameRoom,
    setupRoom,
    deleteGameRoom,
    init,
    invitePlayers
  }

  const discordjs = require('discord.js')
  const Room = require('../models/room')
  const joinReact = '👍'

  async function init (client) {
    let rooms = await Room.find({})
    rooms.map((room) => {
      setupRoom(room.id, room.require, client)
    })
  }

  async function invitePlayers (msg, game) {
    let details = require(`../room-games/${game}`).details
    if (details === null || details === undefined) {
      details = {
        intro: 'Who wants in?'
      }
    }

    let prompt = await msg.channel.send(`${details.invite}\nReact with ${joinReact} to join this game.`)
    prompt.react(joinReact)
    let reactions = await prompt.awaitReactions((reaction) => {
      return reaction.emoji.name === joinReact
    }, {maxUsers: details.players.max + 1, time: 10000})

    const users = reactions.first()
      .users
      .filter((u) => {
        return u.id !== msg.client.user.id
      }).array()
    if (users.length < details.players.min) {
      return msg.reply(`${game} requires at least ${details.players.min} players, sorry`)
    }

    let message = ''

    for (let i = 0; i < users.length; i++) {
      message += users[i].toString()
      if (i < users.length - 1) {
        message += ', '
      }
    }

    let room = await createGameRoom(msg, reactions, 'testroom', `../room-games/${game}`)
    return msg.channel.send(`${message}: your game is ready for you in ${room.toString()}`)
  }

  async function createGameRoom (msg, responses, name, requirePath) {
    // give all players access
    let overwrites = []
    let players = []
    let readwrite = new discordjs.Permissions(['READ_MESSAGES', 'SEND_MESSAGES']).bitfield
    responses.first().users.map((user) => {
      overwrites.push({
        id: user.id,
        type: 'member',
        allow: readwrite
      })
      players.push(user.toString())
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
    try {
      let init = require(requirePath).init(players)
      const room = await msg.guild.createChannel(`${name}-${discriminator}`, 'text', overwrites)

      setupRoom(room.id, requirePath, msg.client, true)
      const roomObj = new Room({
        id: room.id,
        require: requirePath,
        gameState: init
      })

      roomObj.save().catch((e) => { throw e })

      return room
    } catch (err) {
      throw err
    }
  }

  function createGameRoomInhibitor (roomId, gameRequire) {
    return (message) => {
      if (message.channel.id === roomId) {
        const prefix = message.guild ? message.guild.commandPrefix : this.client.commandPrefix
        const content = message.content.substring(prefix.length).trim()
        Room.findOne({id: roomId}).then(async (room) => {
          if (room.gameState === undefined || room.gameState === null) {
            room.gameState = {}
          }

          try {
            let result = require(gameRequire).run(message.author.toString(), content, room.gameState)
            if (result === false) {
              return deleteGameRoom(roomId, message.client, message.guild)
            }

            if (result === null || result === undefined || result.gameState === null || result.gameState === undefined) {
              throw new Error('The game state was not returned')
            }

            room.gameState = result.gameState
            room.markModified('gameState')
            room.save().catch((err) => { throw err })

            return message.say(result.message)
          } catch (err) {
            throw err
          }
        }).catch((err) => {
          return message.say(`${err} : ${err.stack}`)
        })

        return true
      }

      return false
    }
  }

  function setupRoom (roomId, gameRequire, client, first = false) {
    if (!client.channels.has(roomId)) {
      return deleteGameRoom(roomId, client)
    }

    // inhibit commands in this room
    let inhibitor = createGameRoomInhibitor(roomId, gameRequire)

    client.gamerooms[roomId] = inhibitor
    client.dispatcher.addInhibitor(inhibitor)
    if (first) {
      const intro = require(gameRequire).details.intro
      client.channels.get(roomId).send(`Welcome! All commands sent to me in this channel will be sent to the game. Have fun!\n${intro}`)
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
