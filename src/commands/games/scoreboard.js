(function () {
  const commando = require('discord.js-commando')
  const Scoreboards = require('../../utils/scoreboards')

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
            default: 'self',
            prompt: 'Who\'s score do you want to see?',
            type: 'user',
            infinite: false
          }
        ]
      })
    }

    async run (msg, args) {
      let target = args.player === 'self' ? msg.author : args.player
      const playerDetails = await Scoreboards.getPlayer(target.id)

      if (playerDetails === null) {
        if (target === msg.author) {
          return msg.reply(`you haven't got any best scores yet`)
        }
        return msg.reply(`no scores found for ${target}`)
      }

      let message = `the best scores for ${target} are: `
      if (target === msg.author) {
        message = 'your best scores are:'
      }

      for (var i = 0; i < playerDetails.scores.length; i++) {
        const score = playerDetails.scores[i]
        message += `\n${score.gameId}: ${score.score}`
      }

      return msg.reply(message)
    }
  }
})()
