(function () {
  const commando = require('discord.js-commando')
  const gamesList = require('../../room-games/list')
  module.exports = class GameRoomCommand extends commando.Command {
    constructor (client) {
      super(client, {
        name: 'gamedetails',
        aliases: ['gd'],
        group: 'games',
        memberName: 'gamedetails',
        description: 'Gets more information about a game',
        details: `Provide more detailed information about a game. List available games with \`gameslist\``,
        examples: ['gamedetails {some game}'],
        args: [
          {
            key: 'gamedetails',
            label: 'gamedetails',
            prompt: 'Which game would you like to know more about?',
            type: 'string',
            infinite: false
          }],
        guildOnly: false
      })

      this.gameRooms = client.gameRooms
    }

    async run (msg, args) {
      console.log('gamesList', gamesList)
      console.log('args.gamedetails', args.gamedetails)
      if (gamesList.indexOf(args.gamedetails) === -1) {
        return msg.reply('I don\'t know that one')
      }

      var details = {}
      try {
        details = require(args.gamedetails).details
      } catch (err) {
        details = require(`../../../src/room-games/${args.gamedetails}`).details
      }

      return msg.reply([`${details.title} is a game for ${details.players.min} to ${details.players.max} players and ideal for ${details.players.recommended}.`, details.description])
    }
  }
})()
