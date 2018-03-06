(function () {
  const commando = require('discord.js-commando')
  const gamesList = require('../../room-games/list')
  module.exports = class RoomGameListCommand extends commando.Command {
    constructor (client) {
      super(client, {
        name: 'gameslist',
        aliases: ['gl'],
        group: 'games',
        memberName: 'gameslist',
        description: 'Lists the room games available to play'
      })
    }

    async run (msg, args) {
      let message = 'Available games are: '
      for (var i = 0; i < gamesList.length; i++) {
        const game = gamesList[i]
        message += `${game}`
        if (i < gamesList.length - 1) {
          message += ', '
        }
      }

      msg.reply(message)
    }
  }
})()
