(function () {
  const commando = require('discord.js-commando')

  module.exports = class GetScoreboardCommand extends commando.Command {
    constructor (client) {
      super(client, {
        name: 'scoreboard',
        aliases: [],
        group: 'games',
        memberName: 'scoreboard',
        description: 'Gets the scoreboard for a game or player',
        details: '',
        examples: ['scoreboard @johnsmith', 'scoreboard game'],
        args: [
          {
            key: 'player',
            label: 'player',
            prompt: 'Who\'s score do you want to see?',
            type: 'user',
            infinite: false
          }
        ]
      })
    }

    async run (msg, args) {
      const Scoreboards = require('../../utils/scoreboards')
      const playerDetails = await Scoreboards.getPlayer(args.player.id)

      let message = 'your best scores are:'
      for (var i = 0; i < playerDetails.scores.length; i++) {
        const score = playerDetails.scores[i]
        message += `\n${score.gameId}: ${score.score}`
      }

      msg.reply(message)
    }
  }
})()
