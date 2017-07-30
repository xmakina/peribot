(function () {
  const commando = require('discord.js-commando')
  const {invitePlayers} = require('../../utils/gameRooms')
  const gamesList = require('../../room-games/list')
  module.exports = class GameRoomCommand extends commando.Command {
    constructor (client) {
      super(client, {
        name: 'gameroom',
        aliases: ['gr'],
        group: 'games',
        memberName: 'gameroom',
        description: 'Creates a game room',
        details: `Create a game room with the specified game. List available games with \`gameslist\``,
        examples: ['room'],
        args: [
          {
            key: 'game',
            label: 'game',
            prompt: 'What would you like to play?',
            type: 'string',
            infinite: false
          }],
        guildOnly: true
      })
    }

    async run (msg, args) {
      if (gamesList.indexOf(args.game) === -1) {
        return msg.reply('I don\'t know that one')
      }

      return invitePlayers(msg, args.game)
    }
  }
})()
