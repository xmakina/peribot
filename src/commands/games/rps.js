(function () {
  const getResponse = require('../../utils/getResponse.js')
  const commando = require('discord.js-commando')

  module.exports = class GetQuoteCommand extends commando.Command {
    constructor (client) {
      super(client, {
        name: 'rock-paper-scissors',
        aliases: ['rps'],
        group: 'games',
        memberName: 'rps',
        description: 'Plays Rock/Paper/Scissors',
        details: 'A great way to pick a winner quickly',
        examples: ['rps @johnsmith'],
        args: [
          {
            key: 'opponent',
            label: 'opponent',
            prompt: 'Who will you challenge?',
            type: 'user',
            infinite: false
          }
        ]
      })
    }

    async run (msg, args) {
      if (msg.author.id === args.opponent.id) {
        msg.reply('don\'t play with yourself in public')
        return null
      }

      let responses = await getResponse(msg,
        'Rock, Paper or Scissors?',
        20000,
        [msg.author, args.opponent],
        false)

      if (responses === null) {
        return null
      }

      switch (responses.responses.length) {
        case 0:
          responses.abandon()
          return msg.reply('no one told me their choices! Challenge cancelled.')
        case 1:
          responses.abandon()
          return msg.reply('I only got one response. Challenge cancelled.')
        case 2:
          break
        default:
          responses.abandon()
          console.error('too many responses', responses.responses)
          return msg.reply('I got too many responses, something has gone wrong!')
      }

      let first = responses.responses[0].responses.first()
      let second = responses.responses[1].responses.first()
      let challenge = null
      let defence = null

      if (first.author.id === msg.author.id) {
        challenge = first.content
        defence = second.content
      } else {
        defence = first.content
        challenge = second.content
      }

      var RockPaperScissors = require('rpslib')
      var result = RockPaperScissors(challenge, defence)

      return msg.reply(result.message
      .replace('my', args.opponent.toString() + '\'s')
      .replace('beats', '**beats**')
      .replace('loses', '__loses__')
      .replace('ties', '*ties*'))
    }
  }
})()
