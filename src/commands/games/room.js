(function () {
  const commando = require('discord.js-commando')
  const {createGameRoom} = require('../../discord.js-game-rooms/createGameRoom')
  module.exports = class CreateRoomCommand extends commando.Command {
    constructor (client) {
      super(client, {
        name: 'room',
        aliases: [],
        group: 'games',
        memberName: 'room',
        description: 'Creates a room',
        details: '',
        examples: ['room']
      })
    }

    async run (msg, args) {
      let prompt = await msg.channel.send(`Who wants in? React with 👍`)
      let reactions = await prompt.awaitReactions((reaction) => {
        return reaction.emoji.name === '👍'
      }, {maxUsers: 1, time: 10000})

      let room = await createGameRoom(msg, reactions, 'testroom', '../discord.js-game-rooms/test-game')
      return msg.reply(`See you in ${room.toString()}!`)
    }
  }
})()
